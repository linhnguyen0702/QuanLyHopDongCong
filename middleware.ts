import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = [
  "/",
  "/contracts",
  "/contractors",
  "/reports",
  "/settings",
  "/security",
  "/audit",
  "/approvals",
  "/profile",
];

// Define public routes
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const customToken = req.cookies.get("auth_token")?.value;

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Check if the current path is public
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // If accessing a protected route without any token, redirect to login
    if (isProtectedRoute && !token && !customToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing a public route with token, redirect to dashboard
    if (isPublicRoute && (token || customToken)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const customToken = req.cookies.get("auth_token")?.value;

        // Allow access if user has either NextAuth token or custom token
        if (token || customToken) return true;

        // Allow access to public routes and demo page
        const publicAndDemoRoutes = [...publicRoutes, "/demo"];
        const isPublicRoute = publicAndDemoRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/")
        );

        return isPublicRoute;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
