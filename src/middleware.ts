import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/verificationSuccess',
  '/verificationFailed',
  '/loginWithOfficehassle',
  '/forgotPassword',
];

export async function middleware(request: NextRequest) {
  // Get the session
  const session = await auth();

  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow access to public routes without a session
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to /login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url); // Preserve the original URL
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
}

// Apply middleware to all routes except static assets, Next.js internals, and auth API
export const config = {
  matcher: [
    // Match all routes except:
    // - Next.js internals (_next/*)
    // - API routes (api/*)
    // - Static assets (files with extensions like .png, .jpg, .ico, etc.)
    '/((?!_next|api/|.*\\..*).*)',
  ],
};
