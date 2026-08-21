# Faizan Tariq — Portfolio

A single-page, dependency-free portfolio built for GitHub Pages. Dark instrument-panel
theme, a hand-written 3D systems graph in the hero, expandable case studies with
before/after figures, a CSS-3D skill sphere, and a ⌘K command palette.

**Zero runtime dependencies.** No Three.js, no GSAP, no build step, no bundler.
HTML + CSS + JS is roughly 100 KB uncompressed, ~22 KB gzipped.

---

## Repository structure

```
faizan-tariq-portfolio/
├── index.html                 # All markup + SEO metadata + JSON-LD
├── styles.css                 # Design tokens and every style, in labelled blocks
├── script.js                  # All behaviour, in 12 labelled modules
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── .nojekyll                  # Serve files as-is, skip Jekyll
├── .gitignore
├── README.md
└── assets/
    ├── img/
    │   ├── favicon.svg            # Primary icon
    │   ├── apple-touch-icon.png   # 180×180
    │   ├── icon-192.png / icon-512.png
    │   ├── og-image.png           # 1200×630 social card
    │   ├── faizan.webp            # Portrait, background removed (41 KB)
    │   └── faizan.png             # PNG fallback (44 KB)
    ├── docs/
    │   └── fibabanka-capstone.pdf # Public copy of the IE 402 report
    └── resume/
        └── Faizan-Tariq-Resume.pdf
```

---

## Page structure

| # | Section | What it does |
|---|---|---|
| — | Hero | Live systems graph + headline claim + four impact metrics |
| 01 | Profile | The story, a parallax portrait, and a scannable facts panel |
| 02 | In production | Interactive isometric 3D stack of the eight modules kept running in production |
| 03 | Approach | Four operating principles, each tied to a real job |
| 04 | Capability | Draggable 3D skill sphere + categorised stack |
| 05 | Experience | Scroll-driven timeline, six roles |
| 06 | Case studies | Three expandable deep dives (Context → What I did → Result), each with a different figure type, plus three secondary builds |
| 07 | Education | Degree, capstone link, certificates |
| 08 | Contact | Email with copy button, links, resume |

---

## Interactive features

- **Systems graph (hero)** — ~114 points on a Fibonacci sphere, projected by hand, edges between near neighbours, amber packets travelling along a few of them. Labels are the real systems from the resume. Move the pointer near any labelled node and it lights up along with every edge it touches.
- **Isometric systems stack** — eight CSS-3D plates that open out as the section scrolls into view. Hovering, tapping or keyboard-focusing a legend entry lifts and isolates that layer.
- **Parallax portrait** — four depth layers (bloom, ground plate, tracing arc, subject) tracked against the pointer, each moving at its own rate.
- **Approval race** — plays the manual five-hour cycle against the automated one in real time, compressed to a few seconds. Autoplays once when the panel opens, replayable on demand.
- **Case study accordion** — one panel open at a time; height animates via `grid-template-rows: 0fr → 1fr`, so nothing has to be measured.
- **Three figure types, one per case** — animated before/after bars where both numbers exist (350→168 tickets), the approval race for the timing comparison, and a donut for the single-value outcome (95% on schedule). No figure is ever invented to fill a slot.
- **Command palette** — ⌘K / Ctrl+K, or the button in the nav. Jumps to sections, downloads the resume, opens the capstone, copies the email. Full arrow-key and Enter support.
- **Skill sphere** — drag to spin. Decorative; the same skills exist as real text beside it.
- **Copy-to-clipboard** — with a toast, and a fallback for non-secure contexts.
- **Pointer flourishes** — custom cursor, magnetic buttons, card spotlight and tilt. Desktop only, disabled under reduced motion.

---

## Deploy to GitHub Pages

1. Create a public repository. Either:
   - `faizan-tariq-portfolio` → `https://USERNAME.github.io/faizan-tariq-portfolio/`
   - `USERNAME.github.io` → `https://USERNAME.github.io/` (cleaner, recommended)
2. Push these files to the repository root:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → **Save**.
4. Wait ~60 seconds and open the URL shown on that page.

### Custom domain (optional)
Add a `CNAME` file containing only your domain, point a `CNAME` DNS record at
`USERNAME.github.io`, then enable **Enforce HTTPS**.

---

## Before you publish

| Where | Placeholder | Replace with |
|---|---|---|
| `index.html` — canonical, OG, Twitter, JSON-LD | `https://your-username.github.io/faizan-tariq-portfolio/` | Your live URL |
| `robots.txt`, `sitemap.xml` | same URL | Your live URL |
| `index.html` — contact section | `GITHUB SLOT` (commented out) | Uncomment and swap `USERNAME` |

The GitHub link ships commented out on purpose — a dead link costs more than a
missing one. Uncomment the block once you have the handle.

---

## Two things to know about the assets

### The resume PDF

The five files originally supplied as `.pdf` were **not PDFs** — they were ZIP
archives of page images with the extension renamed. A browser would have refused
to open any of them from a download button.

`assets/resume/Faizan-Tariq-Resume.pdf` is a real 2-page A4 PDF rebuilt from the
strongest version. It opens correctly everywhere, but it is **image-based**,
because that's all the source contained — an applicant tracking system can't read
text out of it. Before applying anywhere, open the original in Word, use
**File → Save as → PDF**, and replace this file. Same filename, nothing else changes.

### The capstone report

`assets/docs/fibabanka-capstone.pdf` is a **public copy**, not the original. The
original front matter contained the student ID numbers of all six team members and
a page carrying six handwritten signatures. Publishing that would expose five other
people's personal data on a public URL.

The public copy therefore:
- replaces the original cover with one crediting the team by name only,
- drops the approval page and the signed declaration page,
- keeps the remaining 54 pages completely unaltered,
- states the redaction openly on the new cover.

If you'd rather not publish it at all, delete the file and remove the two links
(one in the P/06 card, one in the Education section).

---

## Optimization checklist

Done:

- [x] No frameworks or CDN libraries — one HTML, one CSS, one JS file
- [x] `defer` on the script; CSS is the only render-blocking resource
- [x] `preconnect` to Google Fonts, `display=swap`, system-font fallbacks
- [x] Portrait served as WebP with a PNG fallback via `<picture>`, and preloaded
- [x] Canvas capped at 2× device pixel ratio
- [x] Both animation loops park themselves when off-screen or when the tab is hidden
- [x] Scroll handlers passive and rAF-throttled
- [x] Animation limited to `transform` and `opacity`
- [x] `prefers-reduced-motion` honoured throughout — no boot screen, no cursor, one static graph frame, panels open, figures drawn without animating
- [x] Semantic landmarks, skip link, visible focus rings, `aria-expanded` on every accordion, full keyboard support in the palette
- [x] Responsive from 320 px up; print stylesheet expands all case studies
- [x] SEO: title, description, canonical, Open Graph, Twitter card, `Person` JSON-LD, sitemap, robots

After launch:

- [ ] Run Lighthouse — target 95+ across the board
- [ ] Self-host the three fonts to remove the third-party request entirely
- [ ] Submit the sitemap in Google Search Console
- [ ] Test on a real mid-range Android device
- [ ] Consider compressing the capstone PDF (2 MB) if page weight matters more than fidelity

### Favicon
`favicon.svg` covers modern browsers at every size; the PNGs cover iOS home
screens and Android install prompts. For the full legacy set, generate a
`favicon.ico` (16/32/48) and add
`<link rel="alternate icon" href="favicon.ico" sizes="any">`.

---

## Local preview

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Use a server rather than opening `index.html` directly — `file://` blocks the
manifest and makes relative paths behave inconsistently.

---

## Content accuracy

Every claim, metric, date, company, tool and credential is taken from Faizan
Tariq's resume and capstone report. Nothing was invented or inflated. The page
carries professional information only. Relocation and geographic-availability
statements are deliberately absent; factual detail such as past job locations,
markets served and client base is retained, because that is track record rather
than a constraint.
