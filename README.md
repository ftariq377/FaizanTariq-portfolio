# Faizan Tariq portfolio website

Plain HTML, CSS and JavaScript. No build step. Hosted from GitHub on Cloudflare.

## Files (18): keep them all at the top level of the repository

index.html, styles.css, script.js, site.webmanifest, robots.txt, sitemap.xml,
favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png,
faizan.png, faizan.webp, Faizan-Tariq-CV.pdf, cv-page-1.jpg, cv-page-2.jpg,
fibabanka-capstone.pdf, README.md

`fibabanka-capstone.pdf` is the IE 402 final report with the team's student ID numbers removed
from the cover. Keep that exact file name: every "Read the report" link points to it.

## Updating the live site

1. In the GitHub repository, click **Add file > Upload files**.
2. Drag in all the files from this folder (not the folder itself) and click **Commit changes**.
   Files with the same name are replaced.
3. Delete `Faizan-Tariq-Resume.pdf` from the repository. The site now uses one master CV.
4. Wait for Cloudflare to redeploy, then press Ctrl + Shift + R on the site.

## Built-in features

- Quick view: role, key numbers, experience and contact on one screen.
- View CV: an in-page preview of the master CV, with a Download button.
- Light and dark themes: the round button in the menu bar; the choice is remembered.
- Skills globe, go-live pipeline, guided tour, before/after comparisons, role fit finder,
  promotion path and the Ctrl/Cmd + K quick menu.

## Changing the CV

Replace `Faizan-Tariq-CV.pdf` with a file of the same name, and replace `cv-page-1.jpg`
and `cv-page-2.jpg` with images of its two pages so the preview matches.
