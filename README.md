# N3X Realty website

Static site (HTML + CSS + one JavaScript file), deployed on Vercel with clean URLs.

## Folder structure

```
n3x-realty/
├── index.html                    Home
├── about.html                    About N3X
├── ai-crm.html                   AI CRM                     (was crm.html)
├── ai-automation.html            AI Automation              (was automation.html)
├── ai-lead-nurture.html          AI Lead Nurture            (was ln.html)
├── lead-generation.html          Lead Generation            (was lg.html)
├── seo-geo.html                  SEO & GEO                  (was sg.html)
├── social-media-marketing.html   Marketing & Branding       (was smm.html)
├── real-estate-websites.html     Real Estate Websites
├── blog.html                     Blog listing (/blog)
├── blog/<slug>.html              One page per article (/blog/<slug>), plus blog/rss.xml
├── privacy-policy.html           Privacy Policy             (new)
├── terms-of-service.html         Terms of Service           (new)
├── 404.html                      Not-found page             (new)
├── favicon.ico
├── site.webmanifest              App icon / theme colour for phones
├── robots.txt, sitemap.xml       Search engines
├── vercel.json                   Clean URLs + 301 redirects from the old short URLs
└── assets/
    ├── css/
    │   ├── main.css              Shared: colours, type, buttons, header, footer, modal
    │   └── pages/<page>.css      One stylesheet per page (home.css, blog.css, ai-crm.css, …)
    ├── js/
    │   ├── main.js               Site behaviour: menus, tabs, FAQs, counters, carousel…
    │   └── book-demo.js          The "Book a demo" form (shared by every page)
    └── images/brand/             Logo, favicons, social share image
```

File names match the live URLs (`/ai-crm`, `/seo-geo`, …). Old addresses such as
`/crm` or `/smm` permanently redirect to the new ones (see `vercel.json`).

## JavaScript

The eight page scripts and the inline script on the home page were merged into two
files. `assets/js/main.js` runs everything except the booking form; each feature checks
whether its markup exists before running, so the same file works on every page.

The **Book a demo** form lives in `assets/js/book-demo.js`. It builds the popup itself,
so the form no longer has to be pasted into every page. Every page loads it right after
`main.js`. Anything with `href="#book-demo"` (or the `data-open-demo` attribute)
opens it, and a link to `any-page#book-demo` opens it on arrival.
Step 2 opens your Google Calendar booking page (or shows it inside the popup if you add the embed link).

Settings near the top of `book-demo.js`:

```js
const DEMO = {
  booking: 'https://calendar.app.google/GkKuokrXA2DLxS4R6',
  bookingEmbed: '',   // optional Google "Website embed" link
  phoneDisplay: '404-981-1910',
  phoneHref: 'https://wa.me/14049811910',
  ...
};
```

## Photos

Photography comes from Unsplash (free licence) and is loaded from
`images.unsplash.com`. To host them yourself, download each image, put it in
`assets/images/photos/`, and replace the URL in the HTML.

Testimonial videos: drop the files in `assets/video/` and add a `<source>` inside the
matching `<video>` on the home page (the comment there shows the exact line). The play
button appears automatically once a video file is present.

## Design system

- Type: Sora (headings) and DM Sans (text), weights 400 / 500 / 600 only, nothing under 12px.
- Colour: brand teal → blue gradient from the logo, ink `#15151c`, cool mist `#f3f6f8` for light sections.
- Primary button: the logo's "Realty" tab shape (chevron point on the left, round on the right).
- Motion: 100–300ms, fade-and-rise reveals only, all of it switched off for visitors who
  ask their device for reduced motion.

See `.ux-profile.md` for the full UI guidelines.

## Blog

- `blog.html` lists every article. `blog/<slug>.html` is one article, on an off-white
  reading background (`assets/css/pages/blog.css`).
- To add an article: copy any file in `blog/`, rename it to the new slug (lowercase,
  words joined by hyphens), then change the `<title>`, meta description, canonical URL,
  the JSON-LD block, the header text and the article body. Add a card for it near the
  top of the list in `blog.html`, a `<url>` line in `sitemap.xml` and an `<item>` in
  `blog/rss.xml`.
- Pages inside `blog/` link to the rest of the site with `../` (for example
  `../assets/css/main.css`).

## Analytics

Every page has the Google tag (`G-RS92PF2SN4`) directly after `<head>`. Add the same
snippet to any new page, once.

## Claims and content

Only publish numbers, client names, logos and reviews you can prove. Testimonials need the
client's permission, and US law (the FTC rule on fake reviews and testimonials) applies
to businesses marketing to US consumers wherever they are based.
