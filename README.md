# Website Tech Stack Detector: CMS, Hosting & Analytics

For sales teams, agencies and developers who need to know what a list of websites is built on: one row per URL with its CMS, ecommerce platform, framework, analytics, hosting, payment and chat tools.

## What you get

- `cms`, `ecommerce` and `jsFrameworks`: for example WordPress, Shopify or Next.js
- `analytics`, `payment` and `liveChat`: for example Google Analytics, Stripe or Intercom
- `cdnHosting` (for example Cloudflare or Vercel), plus the raw `server`, `poweredBy` and `generator` values the site reports, which can include the exact WordPress version
- `status` and `error` on every row: `"ok"`, or `"error"` with the reason a site couldn't be checked, so you always know which URLs failed and why

## Example output

Real output from a run on Apify (2026-10-19):

```json
{
  "rowType": "site",
  "url": "https://www.brooklinen.com/",
  "finalUrl": "https://www.brooklinen.com/",
  "status": "ok",
  "error": null,
  "cms": [],
  "ecommerce": ["Shopify"],
  "jsFrameworks": [],
  "analytics": ["Google Analytics"],
  "cdnHosting": ["Cloudflare"],
  "payment": [],
  "liveChat": [],
  "server": "cloudflare",
  "poweredBy": null,
  "generator": null,
  "analyzedAt": "2026-10-19T03:40:53.782Z"
}
```

In the same run, techcrunch.com came back as WordPress on Cloudflare with `"generator": "wordpress 6.9.10"`, and notion.com as Next.js on Vercel and Cloudflare. A domain that doesn't exist came back like this, and wasn't charged:

```json
{
  "rowType": "error",
  "url": "https://this-domain-does-not-exist-xyz123.com/",
  "finalUrl": null,
  "status": "error",
  "error": "The domain doesn't resolve (DNS lookup failed)."
}
```

(The empty technology fields are left out of this second example.)

## What it costs

$0.007 per site analyzed on the Free plan, and less on paid Apify plans ($0.0065 Bronze, $0.006 Silver, $0.0055 Gold and above). Nothing else is billed.

- 100 sites checked = $0.70
- 1,000 sites checked = $7.00

Only rows with `"status": "ok"` are charged. A URL that can't be checked gets an `"error"` row with the reason and costs nothing. A URL listed twice is checked, and charged, once.

## Use cases

- Before a sales call, find which leads run Shopify, WordPress or HubSpot.
- Before quoting a redesign or migration, check a prospect's CMS and hosting.
- Count how many sites in a list use a given analytics, payment or chat tool.

## Input

| Field | Type | Description |
|---|---|---|
| `startUrls` | array of URLs | The websites to check. Only the homepage of each is checked, not the whole site. If you leave it empty, it checks brooklinen.com, techcrunch.com and notion.com. |

```json
{
  "startUrls": [
    { "url": "https://www.brooklinen.com" },
    { "url": "https://techcrunch.com" },
    { "url": "https://www.notion.com" }
  ]
}
```

## Related tools

- [Tech Stack Lead Finder](https://apify.com/m_ctim/tech-stack-lead-finder): find sites that use a technology, for example Shopify stores without Klaviyo, across 120+ technologies
- [Website Email & Phone Extractor](https://apify.com/m_ctim/website-lead-extractor): get the contact details of the sites you want to pitch
- [Website Gap Finder](https://apify.com/m_ctim/website-gap-finder): audit local businesses' websites and find the ones that need a new site

## Notes

- **What it recognises:** 36 technologies.
  - CMS: WordPress, Drupal, Joomla, Wix, Squarespace, Webflow, Ghost, HubSpot CMS
  - Ecommerce: Shopify, WooCommerce, Magento, BigCommerce
  - Frameworks: Next.js, Nuxt, React, Vue.js, Angular, jQuery
  - Analytics: Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, Segment, Mixpanel, HubSpot Analytics
  - Hosting and CDN: Cloudflare, Vercel, Netlify, AWS CloudFront, Fastly, GitHub Pages
  - Payment: Stripe, PayPal
  - Chat: Intercom, Drift, Zendesk Chat
- **How it checks:** it reads the homepage's HTML and response headers from one plain HTTP request, with no browser. Tools that load later through JavaScript or a tag manager can be missed. For example, stripe.com shows only Next.js and an nginx server.
- **When a site blocks it:** sites that refuse automated requests come back as `"error"` with the HTTP status (for example 403), uncharged.
- **Freshness:** every run checks the live site. Nothing is cached.
- **Feedback and support:** open an issue in the Issues tab on this page. Missing technologies you'd like detected are welcome there too.
