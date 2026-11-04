# 🌱 Loneitu — MIZORAM TAN

A complete, responsive, full-stack digital publication and editorial CMS web application focused on agriculture, farming practices, and allied sectors (**Agronomy & Soil Science**, **Agro-Tech & Precision Irrigation**, **Horticulture & Orchards**, **Animal Husbandry & Silvopasture**, **Organic & Biological Controls**, and **Sustainable Rural Practices**).

---

## 🎨 Visual Design & Layout Architecture

* **Aesthetic:** Clean, modern, earthy, and elegant.
  * **Color Palette:** Deep Forest Green (`#143520`, `#1E542E`), Warm Soil Earth Tones (`#6F5B3C`, `#3B2E1D`, `#8F7855`), Botanical Sage Accents (`#BFDC28`, `#DFEDE3`), and Off-White / Parchment backgrounds (`#FBFBF8`, `#F6F4EB`).
  * **Typography:** Editorial serif headings (**Fraunces**) paired with high-legibility sans-serif UI typography (**Plus Jakarta Sans**) and monospaced telemetry (**JetBrains Mono**).
* **Desktop View:** Edge-to-edge full-width window approach (`100vw` container-fluid) with balanced padding and max-content constraints (`max-w-7xl` / `max-w-4xl`) for ergonomic long-form reading on ultra-wide displays.
* **Mobile View:** Mobile-first responsive optimization with a sticky header, smooth sliding navigation drawer, fast-loading media cards, and thumb-friendly tap targets.

---

## 🚀 Core Features & Functional Modules

### 1. Public User Interface
* **Home Page:**
  * **Hero Lead Story:** Prominently spotlights featured investigations with high-resolution photography, author credentials, reading time, publication date, and instant read CTAs.
  * **Live Agricultural Telemetry Feed:** Real-time ticker displaying key agronomic benchmarks (moisture savings, fungal biomass ratios, microclimate buffers).
  * **Simultaneous Category & Tag Filtering Bar:**
    * Filter simultaneously by **Core Sector Categories** (Agronomy, Agro-Tech, Horticulture, Silvopasture, Organic Controls, Rural Policy) and **Practice Tags** (`#SoilHealth`, `#DripIrrigation`, `#AgTech`, `#Silvopasture`, `#Biochar`, etc.).
    * Instant search bar with clear filters reset.
    * Multi-option sorting: *Newest First*, *Oldest First*, *Most Popular*, *Reading Time (Shortest)*, and *Reading Time (Longest)*.
  * **Dynamic Article Card Grid:** Fast-loading cards with thumbnail zoom, category badges, author avatars, reading times, clickable tags, and persistent like & bookmark toggles.
  * **Weekly Furrow Newsletter Section:** Integrated subscriber capture for weekly agronomy dispatches.
* **Article Details Page:**
  * **Reading Progress Bar:** Top edge-to-edge animated scroll indicator.
  * **Breadcrumbs Navigation:** `Journal > Sector > Article Title`.
  * **Interactive Table of Contents:** Automatically parses `##` and `###` headings from markdown content, tracks scroll position, and smoothly scrolls to sections.
  * **Rich Text / Markdown Engine:** Full GitHub Flavored Markdown support (styled tables, agronomy tip callout boxes, blockquotes, code blocks, checklists).
  * **Author Bio Card:** Author avatar, role, institutional affiliation, and bio.
  * **Social Share & Interaction Bar:** Copy link, Twitter/X, LinkedIn, likes counter, and personal reading queue bookmarking.
  * **Community Field Observations:** Interactive comments section where farmers and readers post observations and regional findings.
  * **Related Posts Widget:** Contextually matches related articles sharing common categories and practice tags.
* **Taxonomy Navigation:**
  * **Dedicated Category Archives:** Custom route `/category/:slug` with domain descriptions, active post counts, and filtered article grids.
  * **Dedicated Tag Archives:** Custom route `/tag/:slug` with practice descriptions and article listings.
* **Global Search Modal (`⌘K` / `Ctrl+K`):**
  * Instant search across titles, excerpts, authors, categories, tags, and article bodies.
* **Saved Field Notes Drawer:**
  * Slide-over reading queue storing bookmarked papers locally in the browser with one-click direct access or clearing.

---

### 2. Admin Console & Content Management (`/admin`)

* **Authentication & Access:**
  * Dedicated route `/admin` with secure state persistence.
  * **One-Click Demo Login button** for instant evaluator review, as well as password authentication (passwords: `admin` or `agri2026`).
* **Editorial Dashboard Overview:**
  * Key Performance Indicators (Total Articles, Published vs Drafts, Sectors, Tags, Total Field Readership, and Applauds).
  * Recent articles table with quick status and edit actions.
* **Rich Markdown Content Editor:**
  * Real-time **Side-by-Side Live Preview**, **Editor Only**, and **Full Preview** modes.
  * **Formatting Toolbar:** Heading 2, Heading 3, Bold, Italic, Blockquote, Field Note Callout, Markdown Tables, Bullet Lists, and Code blocks.
  * **Field Inputs:** Title, auto-generated URL slug with manual override, excerpt abstract, author selection, sector category (with inline category creator modal), and interactive tag chips.
  * **Cover Photography Picker:** 8 curated Unsplash agricultural presets for one-click selection, or custom URL entry.
  * **Status Controls:** Direct toggle between **"Published"** and **"Draft"**, plus **"Feature on Home Screen"** toggle.
  * Live word count and automatic reading time calculator.
* **Taxonomy Management:**
  * **Sector Categories Manager:** Create, edit, rename, and delete categories with custom icons, color accents, and descriptions.
  * **Tags Manager:** Create new tags, rename tags across all articles simultaneously, delete unused tags, and monitor article count per tag.
* **System Maintenance & Portability:**
  * **Export Database JSON:** Download a full JSON snapshot of all articles, categories, and tags.
  * **Reset to Seed Data:** One-click restoration back to the rich initial demo dataset.

---

## 🛠️ Tech Stack

* **Framework:** React 19 + TypeScript + Vite 8
* **Styling:** Tailwind CSS v4 with custom earthy theme tokens
* **Routing:** React Router v7 (`react-router-dom`)
* **Markdown Rendering:** `react-markdown` + `remark-gfm`
* **Icons:** `lucide-react`
* **Data Persistence:** Browser `localStorage` with initial seed database

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🔐 Admin Access Details

* **URL Route:** `/admin`
* **Demo Passwords:** `admin` or `agri2026` or `roots`
* **One-Click Login:** A dedicated **"One-Click Demo Admin Login"** button is provided directly on the login screen for testing convenience.

---

## 📄 License
MIT License. Open-source agricultural commons.
