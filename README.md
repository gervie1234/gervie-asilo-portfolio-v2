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
