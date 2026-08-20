# Faizan Tariq — Portfolio

A single-page, dependency-free portfolio built for GitHub Pages. Dark instrument-panel
theme, a hand-written 3D systems graph in the hero, a CSS-3D skill sphere, and a
scroll-driven experience timeline.

**Zero runtime dependencies.** No Three.js, no GSAP, no build step, no bundler.
Total payload is roughly 120 KB including the resume PDF and social image — the
page itself (HTML + CSS + JS) is about 60 KB uncompressed, ~18 KB gzipped.

---

## Repository structure

```
faizan-tariq-portfolio/
├── index.html                 # All markup + SEO metadata + JSON-LD
├── styles.css                 # Design tokens and every style, in 16 labelled blocks
├── script.js                  # All behaviour, in 9 labelled modules
├── site.webmanifest           # PWA/install metadata
├── robots.txt                 # Crawl rules + sitemap pointer
├── sitemap.xml                # Single-URL sitemap
├── .nojekyll                  # Tells GitHub Pages to serve files as-is
├── .gitignore
├── README.md
└── assets/
    ├── img/
    │   ├── favicon.svg        # Primary icon (SVG, scales everywhere)
    │   ├── apple-touch-icon.png   # 180×180
    │   ├── icon-192.png           # Android/PWA
    │   ├── icon-512.png           # Android/PWA
    │   └── og-image.png           # 1200×630 social card
    └── resume/
        └── Faizan-Tariq-Resume.pdf
```

---

## Deploy to GitHub Pages

1. Create a public repository. Two naming options:
   - `faizan-tariq-portfolio` → served at `https://USERNAME.github.io/faizan-tariq-portfolio/`
   - `USERNAME.github.io` → served at `https://USERNAME.github.io/` (cleaner, recommended)
2. Push these files to the repository root:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
3. In the repository: **Settings → Pages → Build and deployment**
   - Source: *Deploy from a branch*
   - Branch: `main`, folder: `/ (root)` → **Save**
4. Wait ~60 seconds, then open the URL shown on that settings page.

`.nojekyll` is already included so GitHub serves the files directly instead of
running them through Jekyll.

### Custom domain (optional)
Add a file named `CNAME` containing only your domain (e.g. `faizantariq.com`),
then point a `CNAME` DNS record at `USERNAME.github.io`. Enable **Enforce HTTPS**
in Settings → Pages.

---

## Before you publish — replace these placeholders

| Where | Placeholder | Replace with |
|---|---|---|
| `index.html` — canonical, OG, Twitter, JSON-LD | `https://your-username.github.io/faizan-tariq-portfolio/` | Your live URL |
| `index.html` — contact section | `https://github.com/your-username` | Your GitHub profile, or delete that `<li>` |
| `robots.txt`, `sitemap.xml` | `your-username.github.io/...` | Your live URL |
| `assets/img/og-image.png` | Generated placeholder card | Optional: regenerate with a headshot |

Everything else on the page comes straight from the resume.

### Adding a headshot (optional)
Drop a square image at `assets/img/faizan.jpg` (600×600, WebP or JPEG, under
80 KB) and add it near the hero stats:
```html
<img src="assets/img/faizan.jpg" alt="Faizan Tariq" width="120" height="120" loading="lazy">
```

---

## What each JS module does

| Module | Purpose |
|---|---|
| 02 Boot | ~900 ms system-check overlay; hides while fonts swap in. Skipped for reduced motion. |
| 03 Nav + rail | Sticky header, mobile menu, scroll-spy, left instrument rail with progress meter. |
| 04 Systems graph | The hero. ~114 points on a Fibonacci sphere, projected by hand, edges between near neighbours, amber packets travelling along a few of them. Labels are real systems from the resume. |
| 05 Reveals | `IntersectionObserver` fade-ups with capped stagger. |
| 06 Counters | Hero stats count up once, on first view. |
| 07 Skill sphere | CSS-3D tag cloud, drag to spin. Decorative — the same skills exist as real text beside it. |
| 08 Timeline | Fills the spine as you scroll; lights the node of the row you're reading. |
| 09 Pointer | Custom cursor, magnetic buttons, card spotlight and tilt. Desktop-only. |

Two separate state classes are used on purpose: `.is-in` (entered the viewport)
and `.is-live` (timeline row currently being read). Don't merge them — they'd
cancel each other out.

---

## Optimization checklist

Already done:

- [x] No frameworks or CDN libraries — one HTML, one CSS, one JS file
- [x] `defer` on the script; CSS is the only render-blocking resource
- [x] `preconnect` to Google Fonts, `display=swap`, system-font fallbacks in the stack
- [x] Canvas capped at 2× device pixel ratio — retina cost without retina benefit is pure waste on mobile
- [x] Both animation loops park themselves when off-screen (`IntersectionObserver`) or when the tab is hidden (`visibilitychange`)
- [x] Scroll handlers are passive and rAF-throttled
- [x] Animation limited to `transform` and `opacity` (compositor-only, no layout thrash)
- [x] `prefers-reduced-motion` honoured throughout: no boot screen, no cursor, one static graph frame, values shown without counting
- [x] Semantic landmarks, skip link, visible focus rings, `aria-hidden` on decorative canvas
- [x] Full keyboard navigation; project cards are focusable
- [x] Responsive from 320 px up; print stylesheet for a clean paper version
- [x] SEO: title, meta description, canonical, Open Graph, Twitter card, `Person` JSON-LD, sitemap, robots

Worth doing after launch:

- [ ] Run Lighthouse (Chrome DevTools) — target 95+ across the board
- [ ] Convert `og-image.png` to WebP if you add photography
- [ ] Self-host the three fonts (`/assets/fonts/`) with `font-display: swap` to remove the third-party request entirely
- [ ] Submit the sitemap in Google Search Console
- [ ] Test on a real mid-range Android device, not just DevTools throttling

### Favicon recommendations
`favicon.svg` is the primary icon and covers modern browsers at every size.
The PNGs cover iOS home screens and Android install prompts. If you want the
complete legacy set, generate `favicon.ico` (16/32/48) from the SVG at
[realfavicongenerator.net](https://realfavicongenerator.net) and add:
```html
<link rel="alternate icon" href="favicon.ico" sizes="any">
```

---

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Use a server rather than opening `index.html` directly — `file://` blocks the
manifest and makes relative paths behave inconsistently.

---

## Content accuracy

Every claim, metric, date, company, tool and credential on this page is taken
from Faizan Tariq's resume. Nothing was invented or inflated. Passport,
citizenship, visa, marital, family and other private details are deliberately
excluded — the page carries professional information only.
