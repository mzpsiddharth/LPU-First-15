# LPU First 15 --- Freshers' Onboarding & Campus Navigation Guide

**Live website:** <https://lpufirst15.vercel.app/>

LPU First 15 is a responsive, six-page website designed to help Lovely
Professional University (LPU) freshers navigate their first days on
campus. It brings induction information, a day-wise schedule, campus
mapping, classroom-number guidance, support contacts, and the
EDU-Revolution portal guide together in one place.

The project is built with **HTML5, Tailwind CSS (CDN), vanilla
JavaScript, and Feather Icons**. It is a static website with no custom
backend or build step.

## Visit the deployed website

Open the live deployment here:

**<https://lpufirst15.vercel.app/>**

The site is deployed on Vercel. The source can be run locally or
deployed again from a Git repository.

## Pages

  -----------------------------------------------------------------------
  Page                    File                    What it covers
  ----------------------- ----------------------- -----------------------
  Home                    `index.html`            Overview dashboard,
                                                  quick actions, 15-day
                                                  roadmap, packing
                                                  checklist, and
                                                  emergency helpline

  Induction schedule      `schedule.html`         Reporting day, Days
                                                  1--3, and the Days
                                                  4--15 setup checklist

  Campus map              `map.html`              Embedded Google My Maps
                                                  campus map and
                                                  classroom-number
                                                  decoder

  Reporting guide         `process.html`          Pre-arrival steps, free
                                                  pick-up information,
                                                  and the Unipolis
                                                  workflow

  Support & helpdesk      `support.html`          Contact directory,
                                                  sample faculty mentor
                                                  roster, and feedback
                                                  form

  EDU-Revolution          `edurev.html`           50-50-50 formula, four
                                                  pillars, nine
                                                  categories, and
                                                  UMS-to-LMS guide
  -----------------------------------------------------------------------

## Features

-   Responsive, mobile-first layout with a collapsible navigation menu.
-   Light-blue visual theme, accessible typography, reduced-motion
    support, and LPU branding.
-   LPU logo and favicon stored in `assets/img/`.
-   **Google My Maps integration:** the campus map is embedded in
    `map.html` using an iframe. Visitors can use the map's built-in
    search, zoom, layer controls, and feature details.
-   **Classroom-number decoder:** enter a value such as `34-501` to
    decode it as Block 34, 5th floor, Room 501. The decoder is separate
    from the Google Maps iframe and cannot automatically highlight a
    building or identify a precise room inside the embedded map.
-   Packing and Days 4--15 checklists persist in browser `localStorage`.
-   Deep links to sections, such as `schedule.html#days-4-15` and
    `process.html#on-arrival`.
-   Feedback form with inline validation, generated reference, and
    copy-message support. It is currently a local demo and does not send
    submissions to a server.
-   Print-friendly schedule and checklists.

## Campus map

The campus map is maintained in Google My Maps and embedded in the
website. To update mapped locations:

1.  Open the LPU campus map in Google My Maps using the Google account
    that owns or can edit it.
2.  Add, rename, restyle, or adjust locations and layers in My Maps.
3.  Keep the map's sharing and embedding permissions configured so
    website visitors can view it.
4.  Allow time for updates to appear in the embedded map, then check the
    live website.

The embedded map is a separate Google interface. The website cannot
directly control its internal search, selected features, or layer panel
with its own JavaScript. The classroom decoder does not automatically
select a building on the map.

**Accuracy note:** Verify building outlines, labels, and locations
before relying on the map for navigation. The project is a
student-oriented campus guide, not an official surveyed map or a
turn-by-turn walking navigation service.

## Project structure

``` text
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
│       ├── main.js        # Navigation, tabs, deep links, checklists, and shared UI
│       ├── campus-map.js  # Classroom-number decoder for the embedded map page
│       ├── support.js     # Contact filtering and feedback form
│       └── edurev.js      # EDU-Revolution guide interactions
├── vercel.json
├── .gitignore
└── README.md
```

## Run locally

No package installation or build step is required.

1.  Download or clone the repository.

2.  Open the project folder in a terminal.

3.  Start a local static server:

    ``` bash
    python -m http.server 8000
    ```

4.  Visit <http://localhost:8000>.

Alternatively, use a static development server such as `npx serve .`.

Internet access is required for external resources, including Tailwind
CSS, Google Fonts, Feather Icons, and the embedded Google My Maps
content. Serving the site over HTTP is recommended because some browsers
restrict `localStorage` when pages are opened directly from `file://`.

## Deployment on Vercel

The project is a static website and does not require environment
variables or server-side functions.

To deploy your own copy:

1.  Push the project folder to a Git repository.
2.  In Vercel, select **Add New → Project** and import the repository.
3.  Use the **Other** framework preset.
4.  Leave the build command empty and set the output directory to the
    project root (`.`), if Vercel asks for it.
5.  Deploy the project and open the generated URL.

The current live deployment is **<https://lpufirst15.vercel.app/>**.

## Customisation

-   **Design:** edit `assets/css/styles.css` and the Tailwind
    configuration in the HTML pages.
-   **Campus locations and layers:** edit the source map in Google My
    Maps; the iframe in `map.html` displays that map.
-   **Classroom decoder:** update `assets/js/campus-map.js` if the
    room-number format or displayed guidance changes.
-   **Schedule:** edit the HTML content in `schedule.html`.
-   **Shared UI and checklists:** see `assets/js/main.js`.
-   **Feedback form:** the current form is a local demo. Configure a
    real form service or backend before using it to collect actual
    feedback.

## Data and usage notes

-   Contact numbers and induction information should be confirmed
    against current official LPU communications before use.
-   The mentor directory is a sample roster layout and should be updated
    with verified information before being treated as an official
    directory.
-   The campus map is maintained by the project owner in Google My Maps.
    It may not show every facility and should be checked for accuracy.
-   Checklists use browser-local storage; their state is stored in the
    visitor's browser and is not synchronised across devices.
-   The feedback form does not currently submit data to a server.
-   Confirm dates, venues, timings, and room assignments with official
    LPU communications.

## Licence

Created as a student-oriented LPU freshers' onboarding guide. LPU
branding and third-party resources remain the property of their
respective owners. This project is not an official LPU website unless
explicitly authorised by the university.
