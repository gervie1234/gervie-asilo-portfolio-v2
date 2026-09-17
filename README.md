# Gervie Asilo Portfolio V2

A minimalist, responsive portfolio for Gervie Asilo, built with React and Vite.

## Highlights

- Responsive profile, projects, experience, impact, stack, and contact sections
- Dedicated projects and tech stack pages
- Light and dark themes with a circular reveal transition
- Optional keyboard and mouse-style interface sounds
- Contact form prepared for Google Sheets and email notifications through Google Apps Script

## Core stack

React, Vite, JavaScript, CSS, Node.js, .NET, PHP, MySQL, and modern AI-assisted development tools.

## Run locally

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
```

Copy `.env.example` to `.env` and configure the contact-form endpoint when deploying the Google Apps Script integration.

Set `VITE_CMS_API_URL` to the public `/api/public` URL of Gervie Portfolio CMS. Project publish and unpublish changes are read from this API; if it is unavailable, the frontend intentionally hides project cards instead of showing stale unpublished content.

## Visitor analytics

Visitor statistics are recorded by the CMS at `VITE_CMS_API_URL/traffic` and viewed in the private admin's **Visitor analytics** menu (`/Analytics`). Set `VITE_CMS_API_URL` to `https://admin.gervieasilo.com/api/public` in the production build. Deploy the CMS analytics migration before this frontend release. Tracking is enabled in production builds only and respects DNT/GPC opt-outs.

Counts are anonymous session estimates, not identified people. Data includes clean page paths, referring hostnames, device categories and Resume/Contact/Email/Phone/Project clicks. Query strings, fragments and contact-form contents are not collected. No Vercel Pro plan is needed.
