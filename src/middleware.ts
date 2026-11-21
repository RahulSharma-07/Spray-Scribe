import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const protectedRoutes = ["/dashboard", "/tools", "/library", "/settings", "/history", "/admin", "/chat"];
  const authRoutes = ["/login", "/signup"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // FORCE ADMINS TO ADMIN PANEL if trying to access user-facing features
  if (isProtected && isLoggedIn && (req.auth?.user as any)?.role === "ADMIN") {
    // Only allow /admin/* for admins in this context
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  if (isAuthRoute && isLoggedIn) {
    // If Admin, redirect to Admin Dashboard, otherwise regular dashboard
    const destination = (req.auth?.user as any)?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/tools/:path*", "/library/:path*", "/settings/:path*", "/history/:path*", "/chat/:path*", "/login", "/signup"],
};
