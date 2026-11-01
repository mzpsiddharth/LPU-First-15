# LPU First 15 — Freshers' Onboarding & Campus Navigation Guide

A responsive, six-page static web app for LPU freshers. It brings the first 15 days of induction into one place: reporting steps, the day-wise schedule, an interactive campus map with a classroom finder, a support directory, and the EDU-Revolution portal guide.

Built with **HTML5, Tailwind CSS (CDN), vanilla JavaScript and Feather Icons**. There is no build step and no backend — every interaction runs in the browser. The site uses the official LPU logo from `lpu.in` and a light-blue, low-decoration design system.

## Pages

| Page | File | What it covers |
| --- | --- | --- |
| Home | `index.html` | Hero dashboard, quick actions, 15-day roadmap, packing checklist, emergency helpline |
| Induction schedule | `schedule.html` | Reporting Day, Days 1–3, and the Days 4–15 setup checklist |
| Campus map | `map.html` | Responsive Google My Maps embed, map-layer controls, classroom number decoder |
| Reporting guide | `process.html` | Pre-arrival steps, free pick-up, and the 8-step Unipolis workflow |
| Support & helpdesk | `support.html` | Contact directory, faculty mentor roster, feedback form |
| EDU-Revolution | `edurev.html` | 50-50-50 formula, four pillars, nine categories, seven-step UMS → LMS guide |

## Features

- Mobile-first layout with a collapsible navigation menu.
- Light-blue theme with a white header, flat cards, soft blue hero sections, high-contrast type and reduced-motion support.
- Official LPU logo in the header and footer, with a compact LPU favicon.
- Responsive Google My Maps embed with built-in search, layer toggles, zoom and feature details.
- Classroom number decoder: `34-501` → Block 34 · 5th Floor · Room 501. The decoder is separate from the map iframe and cannot automatically highlight a building inside Google My Maps.
- Persistent checklists for packing and the Days 4–15 setup, stored in `localStorage`.
- Feature tabs are deep-linkable, for example `schedule.html#days-4-15` and `process.html#on-arrival`.
- Feedback form with inline validation, a generated reference, and copy-message support. It is a local demo and does not send data to a server.
- Print-friendly checklists and schedule.
- All icons come from the Feather icon set; no invalid icon names remain.
- Lighthouse (desktop): **100 Accessibility · 100 Best Practices · 100 SEO** on all six pages.

## Project structure

```text
.
├── index.html
├── schedule.html
├── map.html
├── process.html
├── support.html
├── edurev.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── img/
│   │   ├── favicon.svg
│   │   └── lpu-logo.svg
│   └── js/
│       ├── main.js       # nav, tabs, deep links, checklists, reveal, misc
│       ├── campus-map.js # classroom number decoder for embedded map
│       ├── support.js    # contact filtering + feedback form
│       └── edurev.js     # expand / collapse the portal guide
├── vercel.json
├── .gitignore
└── README.md
```

## Run locally

No install is required. Either:

1. Open `index.html` directly in a browser, or
2. Serve the folder over HTTP for the best experience (some browsers restrict `localStorage` on `file://`):

```bash
# Any static server works, for example:
npx serve .
# or
python -m http.server 8000
```

Then visit `http://localhost:8000`.

Internet access is needed on first load for Tailwind CSS, Google Fonts and Feather Icons from their CDNs.

## Deploy to GitHub + Vercel

1. Create a new repository and push this folder:

   ```bash
   git init
   git add .
   git commit -m "Add LPU First 15 freshers guide"
   git branch -M main
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin main
   ```

2. In Vercel, choose **Add New → Project**, import the repository, and keep the framework preset as **Other**.
3. Leave the build command empty and set the output directory to `.` (the project root). `vercel.json` enables clean URLs and asset caching.
4. Deploy. No environment variables or server functions are needed.

## Customising

- **Design tokens** live at the top of `assets/css/styles.css` (`:root` variables) and in the Tailwind config block inside each page.
- **Campus map source** is the Google My Maps project embedded in `map.html`. Edit locations and layer groups in Google My Maps; the iframe displays the published map.
- **Schedule content** is plain HTML inside the tab panels in `schedule.html`.
- **Storage keys**: `lpuFirst15:checklist:<group>` for checklists and `lpuFirst15:feedback` for the local feedback demo. Old `skilly:*` values are migrated automatically on first load.
- **Feedback form**: set `data-endpoint` on `#feedbackForm` if you later connect a real form service.

## Data notes

- Helpline numbers and contact details follow the supplied induction information: induction `01824-517170`, hospital `01824-444079`, security `01824-444095`, toll-free `1800-137-4422`.
- The mentor directory is an explicitly labelled sample roster layout.
- The embedded campus map is maintained by the project owner in Google My Maps. Verify location accuracy before relying on it for navigation.
- Always confirm dates, venues and timings with the official LPU induction communication.

## Licence

Created for the LPU Freshers' onboarding guide. Content and contact details belong to their respective owners.
