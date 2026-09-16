import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/ routes (except when needed)
     * 2. /_next/ (Next.js internals)
     * 3. /_static/ (inside /public)
     * 4. Static files (favicon.ico, sitemap.xml, robots.txt, etc.)
     */
    '/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  // Root platform domains
  const isPlatformRoot =
    hostname === 'kilatstools.my.id' ||
    hostname === 'www.kilatstools.my.id' ||
    hostname === 'forge-app-engine.vercel.app' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1';

  // 1. Platform Root Domain -> Proceed normally
  if (isPlatformRoot) {
    return NextResponse.next();
  }

  // 2. Subdomains under kilatstools.my.id (e.g. rickyrizky.kilatstools.my.id)
  if (hostname.endsWith('.kilatstools.my.id')) {
    const subdomain = hostname.replace('.kilatstools.my.id', '');

    // Reserved subdomains for system
    if (subdomain === 'www' || subdomain === 'app' || subdomain === 'dashboard' || subdomain === 'api') {
      return NextResponse.next();
    }

    // A. Root of user's subdomain (e.g. https://rickyrizky.kilatstools.my.id/)
    if (url.pathname === '/' || url.pathname === '') {
      return NextResponse.rewrite(new URL(`/u/${subdomain}`, req.url));
    }

    // B. App path directly under subdomain (e.g. https://rickyrizky.kilatstools.my.id/gudangku-inventori-stok)
    if (!url.pathname.startsWith('/preview') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/u/')) {
      const slug = url.pathname.replace(/^\//, '');
      return NextResponse.rewrite(new URL(`/preview/${slug}`, req.url));
    }

    return NextResponse.next();
  }

  // 3. Custom Domain (e.g. kasir.tokoberkah.com)
  // Rewrite root directly to preview handler or custom domain runtime
  if (url.pathname === '/' || url.pathname === '') {
    // If it's a custom domain, rewrite to preview lookup
    return NextResponse.rewrite(new URL(`/preview/custom-domain-runtime?domain=${hostname}`, req.url));
  }

  return NextResponse.next();
}
