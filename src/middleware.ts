
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is now a pass-through as internationalization (i18n) has been removed.
// This file can be deleted if no other global middleware logic is needed in the future.
export function middleware(request: NextRequest) {
  // Simply pass the request through without any i18n logic
  return NextResponse.next();
}

export const config = {
  // This matcher used to be for i18n routes.
  // If you have other middleware logic, adjust this matcher accordingly.
  // If this middleware is truly no longer needed, you can delete this file.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
