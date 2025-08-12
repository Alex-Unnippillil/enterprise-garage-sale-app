import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/managers') && role !== 'manager') {
    const url = new URL('/signin', request.url);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/tenants') && role !== 'tenant') {
    const url = new URL('/signin', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/managers/:path*', '/tenants/:path*'],
};
