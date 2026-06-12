import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refreshToken");
  const userRole = request.cookies.get("userRole")?.value;
  const hasTokenParam = request.nextUrl.searchParams.has("token");

  const authPages = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  // Exclude auth-callback with a token from redirection to let social auth proceed
  const isAuthPage = authPages.includes(pathname) || (pathname === "/auth-callback" && !hasTokenParam);

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/editor");

  // helper function to redirect authenticated users to their dashboard
  const getDashboardRedirectUrl = () => {
    let dashboardPath = "/dashboard";
    if (userRole === "CREATOR") {
      dashboardPath = "/dashboard/creator";
    } else if (userRole === "VISITOR") {
      dashboardPath = "/dashboard/visitor";
    }
    return new URL(dashboardPath, request.url);
  };

  // 1. Authenticated User checks
  if (userRole) {
    const targetDashboard = getDashboardRedirectUrl();

    // Prevent authenticated users from visiting public auth pages or index
    if (isAuthPage || pathname === "/") {
      return NextResponse.redirect(targetDashboard);
    }

    // Redirect base /dashboard path to the role-specific dashboard
    if (pathname === "/dashboard") {
      return NextResponse.redirect(targetDashboard);
    }

    // Gate creator paths for visitors
    if (pathname.startsWith("/dashboard/creator") && userRole !== "CREATOR") {
      return NextResponse.redirect(new URL("/dashboard/visitor", request.url));
    }

    // Gate visitor paths for creators
    if (pathname.startsWith("/dashboard/visitor") && userRole !== "VISITOR") {
      return NextResponse.redirect(new URL("/dashboard/creator", request.url));
    }

    // Gate editor for creators only
    if (pathname.startsWith("/editor") && userRole !== "CREATOR") {
      return NextResponse.redirect(new URL("/dashboard/visitor", request.url));
    }
  } 
  // 2. Unauthenticated User checks
  else {
    // If userRole is missing but we have a refreshToken (e.g. on localhost dev same-domain session),
    // let it proceed so client-side AuthProvider can refresh and populate userRole cookie.
    if (hasRefreshToken) {
      // Allow it to proceed
    } else {
      // Redirect away from protected pages to sign-in
      if (isProtectedPath) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }
      // Redirect index to sign-in directly
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  // Set current pathname in headers for server/layout components if needed
  const response = NextResponse.next();
  response.headers.set("x-stackverse-pathname", pathname);

  return response;
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
