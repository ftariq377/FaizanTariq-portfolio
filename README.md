# Faizan Tariq — Portfolio

A single-page, dependency-free portfolio. Dark instrument-panel theme, a hand-drawn
3D systems graph in the hero, and interactive sections built for recruiters.
No frameworks, no build step — HTML + CSS + JS only.

---

## What changed in the October 2026 update

**Content** — every figure now matches the current resume:
- Senior Operations Associate (Aug 2026 – present), promoted from Operations Associate
- 6–7 go-lives a week, 12 restaurants live, zero churn
- On-time payroll 50–60% → 95% · menu setup 6–7h → 2–4h · open tickets 320 → 208 (−35%)
- Approvals 5h → 1–3h · pizza clients 3 → 12 · 72 demo accounts tracked
- Coopable shown as a part-time contract ending Aug 2026; SkilledForce reporting line and team size added
- Unsupported phrasing removed (e.g. "full P&L", the 38% growth presented as caused by the reporting)

**New features**
| Feature | What it does |
|---|---|
| **Fit finder** (`#fit`) | Recruiter picks the role they're hiring for (6 options). The card swaps in the three strongest matching proof points, the relevant tools, and a 30-second summary with a **Copy** button. **Show it in the timeline** highlights the matching roles. All text comes from the resume. |
| **Go-live pipeline** (`#pipeline`) | Restaurant tokens travel through Handoff → Menu → Payroll & catering → Delivery & marketing → QA → Live, lighting a 12-cell "live" board. Labelled as a workflow illustration; the totals are real. Hover any stage for what happens there. Replay button. |
| **60-second guided tour** | Hero button (and ⌘K). Six stops, ten seconds each, with a spotlight and one line of narration. Pause, Back/Next, arrow keys, Esc to exit. |
| **Impact ticker** | A slow marquee of real results under the hero. Pauses on hover; becomes a static list under reduced motion. |
| **Live board** (case 01) | Twelve cells light up for the twelve go-lives, with "0 churned". |
| **Before/after races** | The race component is now reusable: approvals (5h vs 1–3h) and menu setup (6–7h vs 2–4h). |
| **Skill levels** | Six core tools shown with honest self-assessed levels (Advanced / Intermediate). |
| **Two resume formats** | 1-page resume and 2-page UK/Europe CV, both text-based PDFs that applicant tracking systems can read. |

Everything existing still works: recruiter mode, ⌘K palette, skill → experience evidence links,
capability layers, skill sphere, parallax portrait, reduced-motion support, print styles.

---

## Files in this package

```
index.html
styles.css
script.js
site.webmanifest
robots.txt
sitemap.xml
.nojekyll
.gitignore
README.md
assets/img/favicon.svg            ← browser tab icon
assets/img/apple-touch-icon.png   ← iPhone home-screen icon (180×180)
assets/img/icon-192.png           ← Android icon
assets/img/icon-512.png           ← Android icon
assets/img/og-image.png           ← link preview for LinkedIn / WhatsApp (1200×630, current title and results)
assets/img/faizan.webp            ← portrait
assets/img/faizan.png             ← portrait fallback
assets/resume/Faizan-Tariq-Resume.pdf   ← 1-page resume (text-based, ATS-readable)
assets/resume/Faizan-Tariq-CV.pdf       ← 2-page UK / Europe CV (text-based, ATS-readable)
```

**Two files only you can supply:**
- `assets/docs/fibabanka-capstone.pdf` — your redacted capstone report. Keep the copy already in your
  repository. If it's missing, the site now hides the two "Read the report" links automatically
  instead of showing a broken link.
- `CNAME` — the one-line file that connects your custom domain. Keep the one already in your
  repository. If you're starting a fresh repository, create a file named `CNAME` (no extension)
  containing only your domain, e.g. `faizantariq.com`.

The portrait and icons in this package replace the earlier ones. If you prefer your previous
background-removed portrait, keep your old `faizan.webp` / `faizan.png` instead.

## Deploy to your existing domain

1. **Set your domain.** Replace every `https://YOUR-DOMAIN/` with your live address
   (for example `https://faizantariq.com/`). It appears in:
   - `index.html` — canonical, Open Graph, Twitter and JSON-LD (6 places)
   - `robots.txt` (1) and `sitemap.xml` (1)

   One command does all three files (run inside the folder; macOS needs `sed -i ''`):
   ```bash
   sed -i 's#https://YOUR-DOMAIN/#https://faizantariq.com/#g' index.html robots.txt sitemap.xml
   ```
2. **Copy the files** over the same files in your repository root, and add the two PDFs to
   `assets/resume/`. Do **not** delete `assets/img/`, `assets/docs/` or your `CNAME` file.
3. **Publish:**
   ```bash
   git add .
   git commit -m "Portfolio update: current resume figures, fit finder, go-live pipeline, guided tour"
   git push
   ```
   GitHub Pages redeploys automatically within about a minute.
4. **Check:** open the site in a private window (or hard-refresh) so the old CSS/JS aren't cached.

## Local preview

```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

## Content accuracy

Every claim, metric, date, company, tool and credential matches Faizan Tariq's current resume.
Nothing was invented or inflated. Where a figure is a range (payroll 50–60%, approvals 1–3h,
menu setup 2–4h), the range is shown rather than a single invented number; the payroll "before"
bar is drawn at the top of its range and says so.

The go-live pipeline animation is labelled as an illustration of the workflow; only its totals
(12 live, 0 churned) are data.
