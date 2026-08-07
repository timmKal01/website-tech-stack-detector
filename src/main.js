import { Actor, log } from 'apify';
import { CheerioCrawler } from 'crawlee';
import { detectTechStack } from './signatures.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { startUrls = [] } = input;

if (startUrls.length === 0) {
    throw new Error('No startUrls provided.');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const SITE_ANALYZED_EVENT = 'site-analyzed';

const crawler = new CheerioCrawler({
    requestHandler: async ({ request, $, body, response }) => {
        const { detected, server, poweredBy, generator } = detectTechStack({
            headers: response.headers,
            html: String(body),
            $,
        });

        const totalDetections = Object.values(detected).reduce((sum, arr) => sum + arr.length, 0);

        await Actor.pushData({
            url: request.url,
            finalUrl: response.url ?? request.url,
            ...detected,
            server,
            poweredBy,
            generator,
            analyzedAt: new Date().toISOString(),
        });
        await Actor.charge({ eventName: SITE_ANALYZED_EVENT });

        log.info(`Analyzed ${request.url}`, { totalDetections });
    },
    failedRequestHandler: async ({ request }, error) => {
        log.warning(`Request failed: ${request.url}`, { error: error?.message });
    },
});

await crawler.run(startUrls.map((u) => (typeof u === 'string' ? u : u.url)));

await Actor.exit();
