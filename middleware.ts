// Next.js Edge middleware (runs at the edge before your API routes)
// This file is automatically run by Next.js when imported in the root directory

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will be applied to all API routes
export function middleware(request: NextRequest) {
  // You can modify the request headers or response here if needed
  // For now, we're just letting all requests through to our API handlers
  return NextResponse.next();
}

// Only apply to API routes
export const config = {
  matcher: '/api/:path*',
};