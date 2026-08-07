/**
 * Each signature gets a context object and returns true/false.
 * `html` is the full lowercased HTML source; `scriptSrcs` and `linkHrefs` are
 * lowercased attribute values; `headers` keys are lowercased.
 */
export const SIGNATURES = [
    // --- CMS ---
    { name: 'WordPress', category: 'cms', test: (c) => c.generator.includes('wordpress') || c.html.includes('wp-content') || c.scriptSrcs.some((s) => s.includes('/wp-includes/')) },
    { name: 'Drupal', category: 'cms', test: (c) => c.generator.includes('drupal') || c.headers['x-generator']?.includes('drupal') || c.html.includes('drupal.settings') },
    { name: 'Joomla', category: 'cms', test: (c) => c.generator.includes('joomla') },
    { name: 'Wix', category: 'cms', test: (c) => c.scriptSrcs.some((s) => s.includes('static.wixstatic.com')) || 'x-wix-request-id' in c.headers },
    { name: 'Squarespace', category: 'cms', test: (c) => c.generator.includes('squarespace') || c.scriptSrcs.some((s) => s.includes('squarespace.com')) || c.html.includes('squarespace.config') },
    { name: 'Webflow', category: 'cms', test: (c) => c.generator.includes('webflow') || c.html.includes('website-files.com') || c.html.includes('data-wf-site') },
    { name: 'Ghost', category: 'cms', test: (c) => c.generator.includes('ghost') },
    { name: 'HubSpot CMS', category: 'cms', test: (c) => 'x-hs-cache-control' in c.headers },

    // --- Ecommerce ---
    { name: 'Shopify', category: 'ecommerce', test: (c) => 'x-shopify-stage' in c.headers || c.scriptSrcs.some((s) => s.includes('cdn.shopify.com')) || c.html.includes('shopify.shop') },
    { name: 'WooCommerce', category: 'ecommerce', test: (c) => c.html.includes('/plugins/woocommerce/') || c.html.includes('class="woocommerce') || c.html.includes("class='woocommerce") },
    { name: 'Magento', category: 'ecommerce', test: (c) => c.html.includes('mage.cookies') || Object.keys(c.headers).some((h) => h.startsWith('x-magento')) },
    { name: 'BigCommerce', category: 'ecommerce', test: (c) => c.html.includes('cdn11.bigcommerce.com') },

    // --- JS framework ---
    { name: 'Next.js', category: 'jsFrameworks', test: (c) => c.html.includes('__next_data__') || c.scriptSrcs.some((s) => s.includes('/_next/static')) },
    { name: 'Nuxt', category: 'jsFrameworks', test: (c) => c.html.includes('__nuxt__') },
    { name: 'React', category: 'jsFrameworks', test: (c) => c.html.includes('data-reactroot') || c.html.includes('data-reactid') },
    { name: 'Vue.js', category: 'jsFrameworks', test: (c) => /\sdata-v-[0-9a-f]{6,8}/.test(c.html) },
    { name: 'Angular', category: 'jsFrameworks', test: (c) => /\sng-version=/.test(c.html) },
    { name: 'jQuery', category: 'jsFrameworks', test: (c) => c.scriptSrcs.some((s) => s.includes('jquery')) },

    // --- Analytics / tag managers ---
    { name: 'Google Analytics', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('google-analytics.com') || s.includes('gtag/js')) },
    { name: 'Google Tag Manager', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('googletagmanager.com/gtm.js')) },
    { name: 'Meta Pixel', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('connect.facebook.net')) && c.html.includes('fbq(') },
    { name: 'Hotjar', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('static.hotjar.com')) },
    { name: 'Segment', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('cdn.segment.com')) },
    { name: 'Mixpanel', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('cdn.mxpnl.com')) },
    { name: 'HubSpot Analytics', category: 'analytics', test: (c) => c.scriptSrcs.some((s) => s.includes('js.hs-scripts.com') || s.includes('js.hs-analytics.net')) },

    // --- CDN / hosting ---
    { name: 'Cloudflare', category: 'cdnHosting', test: (c) => 'cf-ray' in c.headers || c.headers.server === 'cloudflare' },
    { name: 'Vercel', category: 'cdnHosting', test: (c) => 'x-vercel-id' in c.headers || c.headers.server?.toLowerCase().includes('vercel') },
    { name: 'Netlify', category: 'cdnHosting', test: (c) => 'x-nf-request-id' in c.headers || c.headers.server?.toLowerCase().includes('netlify') },
    { name: 'AWS CloudFront', category: 'cdnHosting', test: (c) => 'x-amz-cf-id' in c.headers || c.headers.via?.includes('cloudfront') },
    { name: 'Fastly', category: 'cdnHosting', test: (c) => 'x-fastly-request-id' in c.headers || c.headers['x-served-by']?.includes('cache-') },
    { name: 'GitHub Pages', category: 'cdnHosting', test: (c) => c.headers.server === 'github.com' },

    // --- Payment ---
    { name: 'Stripe', category: 'payment', test: (c) => c.scriptSrcs.some((s) => s.includes('js.stripe.com')) },
    { name: 'PayPal', category: 'payment', test: (c) => c.scriptSrcs.some((s) => s.includes('paypal.com/sdk')) },

    // --- Live chat ---
    { name: 'Intercom', category: 'liveChat', test: (c) => c.scriptSrcs.some((s) => s.includes('widget.intercom.io')) },
    { name: 'Drift', category: 'liveChat', test: (c) => c.scriptSrcs.some((s) => s.includes('js.driftt.com')) },
    { name: 'Zendesk Chat', category: 'liveChat', test: (c) => c.scriptSrcs.some((s) => s.includes('static.zdassets.com')) },
];

const CATEGORIES = ['cms', 'ecommerce', 'jsFrameworks', 'analytics', 'cdnHosting', 'payment', 'liveChat'];

export function detectTechStack({ headers, html, $ }) {
    const lowerHeaders = Object.fromEntries(Object.entries(headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const scriptSrcs = $('script[src]')
        .map((_, el) => $(el).attr('src'))
        .get()
        .filter(Boolean)
        .map((s) => s.toLowerCase());
    const generator = ($('meta[name="generator"]').attr('content') ?? '').toLowerCase();

    const context = { headers: lowerHeaders, html: html.toLowerCase(), scriptSrcs, generator };

    const detected = Object.fromEntries(CATEGORIES.map((cat) => [cat, []]));
    for (const sig of SIGNATURES) {
        if (sig.test(context)) {
            detected[sig.category].push(sig.name);
        }
    }

    return {
        detected,
        server: lowerHeaders.server ?? null,
        poweredBy: lowerHeaders['x-powered-by'] ?? null,
        generator: generator || null,
    };
}
