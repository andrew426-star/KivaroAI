import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  const { pathname } = useLocation();

  // Vercel serves the app for every path, so the 404 is told to crawlers
  // here: don't index this address.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    const previous = document.title;
    document.title = 'Page not found | Kivaro AI';
    return () => {
      meta.remove();
      document.title = previous;
    };
  }, []);

  return (
    <section className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">404 · {pathname}</p>
      <h1 className="text-3xl font-bold">This page doesn&apos;t exist.</h1>
      <p className="max-w-md text-muted-foreground">
        Everything about Kivaro AI is on one page: our services, how we deploy, and how to reach us.
      </p>
      <Link to="/" className="underline underline-offset-4">
        Go to the home page
      </Link>
    </section>
  );
}
