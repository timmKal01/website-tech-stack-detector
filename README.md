# Website Tech Stack Detector — CMS, Analytics & Hosting Finder

Give it a website. It fetches the homepage and identifies what's running it:
CMS, ecommerce platform, JS framework, analytics/tag managers, CDN/hosting
provider, payment widgets, and live chat widgets — from response headers,
meta tags, and script signatures. No headless browser, no proxy.

Built for sales/competitive research (what platform is this prospect on?),
agencies doing tech audits, and market research (who's using Shopify vs.
WooCommerce in a given list of sites).

## Input

| Field | Type | Description |
|---|---|---|
| `startUrls` | array of URLs | Websites to analyze (homepage only, not a crawl). |

```json
{
  "startUrls": [{ "url": "https://example.com" }]
}
```

## Output

One record per URL:

```json
{
  "url": "https://example.com",
  "finalUrl": "https://example.com/",
  "cms": ["WordPress"],
  "ecommerce": ["WooCommerce"],
  "jsFrameworks": ["jQuery"],
  "analytics": ["Google Analytics", "Google Tag Manager"],
  "cdnHosting": ["Cloudflare"],
  "payment": ["Stripe"],
  "liveChat": ["Intercom"],
  "server": "cloudflare",
  "poweredBy": "PHP/8.2",
  "generator": "WordPress 6.7"
}
```

## How it works

Plain HTTP fetch via [Crawlee](https://crawlee.dev)'s `CheerioCrawler`.
Detection is signature-based (`src/signatures.js`): checks the `generator`
meta tag, `<script src>` domains, response headers (`Server`,
`X-Powered-By`, `CF-Ray`, `X-Vercel-Id`, etc.), and a few HTML body markers
per technology. Same approach tools like Wappalyzer use, with a smaller,
hand-written signature set (~30 technologies across 7 categories) rather
than a comprehensive database — it'll correctly return "nothing detected"
for a signature it doesn't have rather than guessing.

Only reads what the site already serves publicly to any visitor's browser —
no login, no evasion of any protection.

## Adding a signature

Add an entry to the `SIGNATURES` array in `src/signatures.js`: a `name`, a
`category` (one of `cms`, `ecommerce`, `jsFrameworks`, `analytics`,
`cdnHosting`, `payment`, `liveChat`), and a `test(context)` function where
`context` has `headers` (lowercased keys/values), `html` (lowercased full
source), `scriptSrcs` (lowercased `<script src>` values), and `generator`
(lowercased meta generator content, or `''`).

## Related products

- [Website Lead Extractor](https://github.com/timmKal01/website-lead-extractor) — contact info from the same site, for outreach once you know what they're running
- [Company Buying Signal Report](https://github.com/timmKal01/company-buying-signal-report) — combine tech stack with hiring activity for a scored buying signal
