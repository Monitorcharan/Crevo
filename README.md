# Crevo

**Ideas deserve another dimension.**

Crevo is an AI-native creative marketplace connecting AI filmmakers, animators, and generative
artists with brands and creative agencies. This repository contains the front end featuring an
interactive 3D cinematic hero sculpture inspired by intertwined liquid chrome ribbons.

Built with **React + Vite + JavaScript**, **React Three Fiber**, **Drei**, and **plain CSS** (no TypeScript, no CSS framework, no external 3D asset dependencies).

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # create an optimized production build in ./dist
npm run preview  # serve the production build locally to verify it
```

> `pnpm install`, `pnpm dev`, `pnpm build`, and `pnpm preview` work as well.

## Deployment

`npm run build` outputs a fully static site to the **`dist/`** folder. That folder is the
deployment artifact — upload its contents to any static host (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3, etc.). No server or backend is required.

## 3D Hero Sculpture

The hero features procedurally generated 3D chrome ribbons matching the dark cinematic brand aesthetic:

- **Procedural Geometry**: Custom cross-sections with thickness, rounded edges, and subtle longitudinal micro-grooves generated via Parallel Transport / Rotation-Minimizing Frames along 3D splines (`src/components/Hero3D/RibbonGeometry.js`, `RibbonCurveData.js`, `RibbonProfiles.js`). No generic torus knots or external models.
- **Physically Based Chrome**: Polished liquid silver metallic material (`MeshPhysicalMaterial`) with procedural tangent-space normal striations (`RibbonTexture.js`).
- **Studio Lighting & Reflections**: Procedural HDR studio reflections via Drei `Environment` with parallel elongated `Lightformer`s casting magenta, hot pink, electric icy cyan, warm peach, and silver softbox streaks (`StudioLighting.jsx`).
- **Interactive Motion**: Gentle floating sway and smoothly damped cursor parallax, automatically disabled when `prefers-reduced-motion` is active (`RibbonMotion.jsx`).
- **Deep Plum Atmosphere**: Deep plum-black radial backdrop shader and restrained UI vignette overlays protecting hero text legibility (`PlumBackground.jsx`, `HeroCanvas.css`).
- **Robustness**: Capped pixel ratio (`dpr` 1–2), WebGL capability detection, and graceful fallback to a CSS composition if WebGL is unavailable (`HeroCanvas.jsx`).
- **Tuning**: Centralized, clearly named tuning constants for geometry, materials, lighting, and motion (`Hero3DTuning.js`).

## Project structure

```
index.html                     # title, meta description, favicon, Google Fonts
public/favicon.svg             # original Crevo mark
src/
  main.jsx                     # React entry
  App.jsx                      # page composition + skip link
  index.css                    # design tokens (CSS variables) + global base styles
  data/navigation.js           # shared section links (header + footer)
  components/
    Header/                    # sticky header, wordmark, section nav
    Hero/                      # headline, CTA, hero layout
    SculpturePlaceholder/      # framed artwork container & fallback
    Hero3D/                    # 3D procedural ribbons implementation
      HeroCanvas.jsx           # R3F Canvas, camera, WebGL detection, fallback
      Hero3DTuning.js          # Centralized parameters for lighting, materials, motion
      Ribbons.jsx              # Ribbon meshes and physical chrome material
      RibbonGeometry.js        # Parallel transport sweep geometry engine
      RibbonCurveData.js       # 3D spline curves and ribbon definitions
      RibbonProfiles.js        # 2D cross-section profile generators with thickness
      RibbonTexture.js         # Procedural longitudinal micro-groove normal map
      StudioLighting.jsx       # Drei Environment with elongated Lightformers
      RibbonMotion.jsx         # Sinusoidal floating & damped pointer parallax
      PlumBackground.jsx       # Deep plum-black radial backdrop shader
    About/                     # about copy + principles
    Footer/                    # closing statement, nav, copyright
backend/                       # Python 3.11+ FastAPI service
  app/                         # Routers, schemas, security, Supabase client
  migrations/                  # PostgreSQL DDL and seed migrations
  tests/                       # Pytest test suite (15 passing tests)
```

## Backend & Database Architecture

Crevo features a Python 3.11+ FastAPI backend integrated with Supabase PostgreSQL, Auth, and Storage. See [`backend/README.md`](file:///c:/Users/cteja/Desktop/Crevo/backend/README.md) for full architecture details, local installation, and migration instructions.
