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
    │   └── pages/<page>.css      One stylesheet per page (home.css, ai-crm.css, …)
    ├── js/
    │   └── main.js               The only script. Every page loads it.
    └── images/brand/             Logo, favicons, social share image
```

File names match the live URLs (`/ai-crm`, `/seo-geo`, …). Old addresses such as
`/crm` or `/smm` permanently redirect to the new ones (see `vercel.json`).

## JavaScript

The eight page scripts and the inline script on the home page were merged into
`assets/js/main.js`. Each feature checks whether its markup exists before running,
so the same file works on every page. Sections are numbered at the top of the file.

The **Book a demo** popup is built by `main.js`, so it no longer has to be pasted into
every page. Anything with `href="#book-demo"` (or the `data-open-demo` attribute)
opens it, and a link to `any-page#book-demo` opens it on arrival.
Step 2 embeds your Calendly page, pre-filled with the visitor's name, email and phone.

Settings at the top of the modal section in `main.js`:

```js
const DEMO = {
  calendly: 'https://calendly.com/firozfahim/15min',
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
