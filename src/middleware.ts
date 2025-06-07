
import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic middleware, can be expanded later if needed for non-i18n purposes
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
