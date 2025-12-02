import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get("userId");

  // Allow auth routes without login
  if (pathname.startsWith("/authenticate") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to login if no userId and trying to access protected route
  if (!userId && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/authenticate/login", request.url));
  }

  // Redirect root to login if not authenticated
  if (!userId && pathname === "/") {
    return NextResponse.redirect(new URL("/authenticate/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*"],
};
