// Puts the server-rendered home page into dist/index.html (see
// src/entry-server.tsx). Run after `vite build` and `vite build --ssr`.
// It never fails the build: if rendering breaks, the site ships as the
// plain single-page app it was, and the reason is printed.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const indexPath = path.join(root, 'dist', 'index.html');
const serverEntry = path.join(root, 'dist-ssr', 'entry-server.js');
const EMPTY_ROOT = '<div id="root"></div>';

try {
  const { render } = await import(pathToFileURL(serverEntry).href);
  const html = render('/');
  if (!html || html.length < 500) throw new Error(`rendered only ${html?.length ?? 0} characters`);
  const template = await readFile(indexPath, 'utf8');
  if (!template.includes(EMPTY_ROOT)) throw new Error('dist/index.html has no empty #root to fill');
  await writeFile(indexPath, template.replace(EMPTY_ROOT, `<div id="root">${html}</div>`));
  console.log(`prerender: / rendered (${Math.round(html.length / 1024)} KB of HTML)`);
} catch (err) {
  console.warn(`prerender: skipped, the site ships unrendered: ${err instanceof Error ? err.message : err}`);
} finally {
  await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
}
