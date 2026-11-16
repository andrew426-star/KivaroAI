import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';

// Build-time only (scripts/prerender.mjs): the home page rendered to HTML,
// so crawlers and link previews read the real page instead of an empty
// <div id="root">. The browser still renders the app itself on load
// (main.tsx), replacing this markup; the 3D hero is lazy, so it stays out
// of the static HTML (its Suspense fallback is what renders here).
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </StaticRouter>,
  );
}
