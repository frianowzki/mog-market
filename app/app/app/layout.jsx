/*
 * Route layout for /app (the terminal).
 *
 * This directory is literally named `app`, nested inside the root `app/`
 * folder — which makes it look like a second root to Next's resolver, so the
 * build fails with "page.jsx doesn't have a root layout" even though the real
 * root layout sits one level up. Declaring a pass-through layout here removes
 * the ambiguity without changing the URL (/app) or re-wrapping the shell.
 */
export default function AppRouteLayout({ children }) {
  return children;
}
