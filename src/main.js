import { Actor, log } from 'apify';
import { CheerioCrawler } from 'crawlee';
import * as cheerio from 'cheerio';
import { detectTechStack } from 'tech-stack-signatures';

await Actor.init();

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const SITE_ANALYZED_EVENT = 'site-analyzed';

// Shopify, WordPress and Next.js in one run, so a first run with no edits shows the range.
const DEFAULT_URLS = ['https://www.brooklinen.com', 'https://techcrunch.com', 'https://www.notion.com'];

// The empty shape of a row (every category present, nothing found), reused for rows that failed.
const EMPTY = detectTechStack({ headers: {}, html: '', $: cheerio.load('') });

const input = (await Actor.getInput()) ?? {};
const given = Array.isArray(input.startUrls) ? input.startUrls : [];
const rawUrls = (given.length ? given : DEFAULT_URLS).map((u) => (typeof u === 'string' ? u : u?.url));

function row(url, finalUrl, status, error, { detected, server, poweredBy, generator } = EMPTY) {
    return { url, finalUrl, status, error, ...detected, server, poweredBy, generator, analyzedAt: new Date().toISOString() };
}

/** "brooklinen.com" -> "https://brooklinen.com". Returns null for anything that isn't an http(s) web address. */
function normalize(raw) {
    const text = String(raw ?? '').trim();
    if (!text) return null;
    try {
        const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
        return /^https?:$/.test(url.protocol) && url.hostname.includes('.') ? url.href : null;
    } catch {
        return null;
    }
}

/** A plain-language reason for a site that couldn't be checked. */
function describeError(error) {
    const msg = String(error?.message ?? error ?? 'Unknown error');
    const status = msg.match(/(\d{3}) status code/)?.[1];
    if (status) {
        const blocked = ['401', '403', '429'].includes(status) ? ' The site may block automated checks.' : '';
        return `The site answered with HTTP ${status}.${blocked}`;
    }
    if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(msg)) return "The domain doesn't resolve (DNS lookup failed).";
    if (/ECONNREFUSED/i.test(msg)) return 'The server refused the connection.';
    if (/ECONNRESET|socket hang up/i.test(msg)) return 'The server closed the connection.';
    if (/timed? ?out|ETIMEDOUT/i.test(msg)) return "The site didn't respond in time.";
    if (/certificate|SSL|TLS/i.test(msg)) return "The site's SSL certificate couldn't be verified.";
    if (/content-?type/i.test(msg)) return "The address isn't an HTML web page.";
    return msg.split('\n')[0].slice(0, 200);
}

// Every input URL gets exactly one row. Until 2026-10-19 a site that failed to load produced no row at
// all, so a buyer who sent 1,000 URLs and got 940 rows couldn't tell which 60 failed, or why.
// Only rows with status "ok" are charged.
const seen = new Set();
const toCheck = [];
for (const raw of rawUrls) {
    const url = normalize(raw);
    if (!url) {
        await Actor.pushData(row(String(raw ?? ''), null, 'error', 'Not a valid website address. Use something like "https://example.com".'));
        continue;
    }
    if (seen.has(url)) continue; // a duplicate is checked (and charged) once
    seen.add(url);
    toCheck.push(url);
}

const crawler = new CheerioCrawler({
    requestHandler: async ({ request, $, body, response }) => {
        const finalUrl = response.url ?? request.url;
        if (response.statusCode >= 400) {
            await Actor.pushData(row(request.url, finalUrl, 'error', describeError(`${response.statusCode} status code`)));
            return; // not charged
        }
        const result = detectTechStack({ headers: response.headers, html: String(body), $ });
        await Actor.pushData(row(request.url, finalUrl, 'ok', null, result));
        await Actor.charge({ eventName: SITE_ANALYZED_EVENT });

        const totalDetections = Object.values(result.detected).reduce((sum, arr) => sum + arr.length, 0);
        log.info(`Analyzed ${request.url}`, { totalDetections });
    },
    failedRequestHandler: async ({ request }, error) => {
        log.warning(`Could not check ${request.url}`, { error: error?.message });
        await Actor.pushData(row(request.url, null, 'error', describeError(error))); // not charged
    },
});

await crawler.run(toCheck);

await Actor.exit();
