import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { detectTechStack } from '../src/signatures.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function detect(fixtureFile, headers) {
    const html = readFileSync(path.join(__dirname, 'fixtures', fixtureFile), 'utf8');
    const $ = cheerio.load(html);
    return detectTechStack({ headers, html, $ });
}

test('WordPress site is detected by generator tag and wp-content path', () => {
    const { detected } = detect('wordpress.html', { server: 'nginx' });
    assert.deepEqual(detected.cms, ['WordPress']);
    // WordPress core ships its own bundled jquery.min.js, so this is a
    // correct positive, not noise.
    assert.deepEqual(detected.jsFrameworks, ['jQuery']);
});

test('Shopify store is detected by API header and CDN script src', () => {
    const { detected } = detect('shopify.html', { 'x-shopify-stage': 'production' });
    assert.deepEqual(detected.ecommerce, ['Shopify']);
});

test('Next.js on Vercel: hosting and framework are detected independently, not conflated', () => {
    const { detected } = detect('next-vercel.html', { 'x-vercel-id': 'iad1::abcde-123' });
    assert.deepEqual(detected.jsFrameworks, ['Next.js']);
    assert.deepEqual(detected.cdnHosting, ['Vercel']);
    assert.deepEqual(detected.cms, []);
});

// Documents a known limitation (raised in a dev.to comment): a site behind a
// generic CDN with no public generator tag and no recognizable script-src
// domains only yields the hosting signal. This is a silent miss, not a wrong
// answer, and no headless-rendering approach fixes it either, since the
// underlying fingerprint (a public domain string or meta tag) just isn't
// there to find.
test('generic site behind Cloudflare with no CMS/framework fingerprint yields only the CDN signal', () => {
    const { detected } = detect('cloudflare-generic.html', { 'cf-ray': '8a1b2c3d4e5f6789-IAD' });
    assert.deepEqual(detected.cdnHosting, ['Cloudflare']);
    assert.deepEqual(detected.cms, []);
    assert.deepEqual(detected.jsFrameworks, []);
});
