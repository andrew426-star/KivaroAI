// Named, independently-invokable page preloaders — used both as the
// lazy() import factory in App.tsx and as hover/focus prefetch triggers
// in Header.tsx, so hovering a nav link warms that page's chunk (and its
// 3D scene's chunk) before the route transition plays. Calling the same
// dynamic import() specifier twice is deduped by the browser's module
// cache, so this is safe to fire from both places.
export const preloadHome = () => import('@/pages/Home');
export const preloadServices = () => import('@/pages/Services');
export const preloadAgents = () => import('@/pages/Agents');
export const preloadAbout = () => import('@/pages/About');
export const preloadContact = () => import('@/pages/Contact');
export const preloadProcess = () => import('@/pages/Process');

export const ROUTE_PRELOADERS: Record<string, () => Promise<unknown>> = {
  '/': preloadHome,
  '/services': preloadServices,
  '/agents': preloadAgents,
  '/about': preloadAbout,
  '/contact': preloadContact,
  '/process': preloadProcess,
};
