# DG Photography Portfolio

A photography portfolio website built with [Astro](https://astro.build), [Sanity CMS](https://www.sanity.io), and [GSAP](https://greensock.com/gsap/). Features procedural canvas-based torn paper collage styling, smooth scroll-triggered hero transitions, responsive masonry gallery layouts, and a lightbox preview.

## 📁 Project Structure

```text
site/
├── public/
│   ├── assets/
│   │   └── torn.js         # Procedural canvas torn paper generator
│   ├── images/             # Static fallback photography & video assets
│   ├── gallery.js          # Archive gallery interactions & lightbox
│   ├── script.js           # Main landing page animations & GSAP triggers
│   └── style.css           # Global portfolio stylesheet
├── src/
│   ├── lib/
│   │   └── sanity.ts       # Sanity client & image URL builder
│   └── pages/
│       ├── index.astro     # Landing page (Hero, Showcase, Intro, Featured Gallery)
│       └── gallery.astro   # Full archive collection page
└── dg-portfolio/           # Sanity Studio CMS
    └── schemaTypes/        # Schemas for site settings, home, and archive
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Website (Astro)

From the `site/` directory:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### 2. Content Studio (Sanity)

From the `site/dg-portfolio/` directory:

```bash
# Install studio dependencies
npm install

# Start Sanity Studio locally
npm run dev
```

## 🛠 Features

- **Procedural Torn Paper Effect**: HTML5 canvas drawing for paper edge fibers, seams, and drop shadows with zero PNG masks.
- **GSAP Scroll Pinning**: Cinematic multi-panel hero opening with polaroid drop animation.
- **Sanity CMS Integration**: Manage portfolio photos, showcase video, artist statement, and site settings with fallback support.
- **Full Collection Archive**: Responsive multi-column masonry gallery with torn-edge lightbox preview.
