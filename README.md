# Salary vs Expenses

A responsive React + Vite + Tailwind + Supabase expense tracker. It keeps the original prototype's navy/green/red/purple visual language, INR formatting, CSS charts and fast expense entry.

## Run locally

```bash
npm install
npm run dev
```

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, the app runs in **Demo Mode** and stores data in this browser.

## Connect Supabase

1. Create a Supabase project.
2. In SQL Editor, run `supabase/001_init.sql`.
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Enable Email/Password authentication. Google is optional; if enabled, configure the OAuth redirect URL for your deployed site.
5. Restart `npm run dev`.

Never put a Supabase service-role key in the frontend.

## Production build

```bash
npm run build
npm run preview
```

The production output is `dist/`.

### Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
- Add an SPA rewrite so unknown routes serve `/index.html`.

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add the same two environment variables.
- Add a `_redirects` rule: `/* /index.html 200` (or equivalent SPA redirect configuration).

## Install on a phone

Open the deployed HTTPS site in a supported mobile browser and choose **Add to Home Screen / Install app**. The app includes a web app manifest and service worker through `vite-plugin-pwa`.

## Offline behavior

The app displays an offline banner. If a cloud-connected user submits an expense while offline, the expense is kept in a local queue and is uploaded automatically after the browser reports that it is back online. Demo Mode is local-first and remains usable offline.

## Accessibility

Inputs have labels, interactive controls have accessible names/states, dialogs/toasts expose ARIA roles, focus rings remain visible, touch targets are at least 44px where practical, and reduced-motion preferences are respected.

## Stage 3 features

- Settings: profile/sign out, monthly defaults, warning threshold, export-all, delete-all confirmation.
- Dark mode: follows system preference initially, with a saved manual toggle.
- PWA install support and offline pending-expense queue.
- Deployment instructions and production build configuration.

## Next steps

- Add recurring expenses and payment methods.
- Add category budgets and receipt photos.
- Add richer backup/import controls.
