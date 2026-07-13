import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, ACCESS_COOKIE } from "@/lib/jwt";

const publicPaths = ["/", "/admin/login", "/vendor/login", "/vendor/signup", "/consultant/login", "/consultant/signup", "/select-login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthApi = pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/admin/login") ||
    pathname.startsWith("/api/auth/vendor/login") ||
    pathname.startsWith("/api/auth/consultant/login") ||
    pathname.startsWith("/api/auth/vendor/register") ||
    pathname.startsWith("/api/auth/consultant/register") ||
    pathname.startsWith("/api/auth/refresh");

  const isPublic = publicPaths.includes(pathname) || isAuthApi;

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const session = token ? await verifyAccessToken(token) : null;

  if (!session && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/select-login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const primaryRole = session.roles?.[0]?.role;
    const isAuthApiRoute = pathname.startsWith("/api/auth");

    if (primaryRole === "VENDOR") {
      const isVendorPath = pathname.startsWith("/vendor") || pathname.startsWith("/api/vendor") || pathname.startsWith("/api/invoices") || pathname.startsWith("/api/files");
      if (!isVendorPath && !isAuthApiRoute) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
      }
    } else if (primaryRole === "CONSULTANT") {
      const isConsultantPath = pathname.startsWith("/consultant") || pathname.startsWith("/api/consultant") || pathname.startsWith("/api/invoices") || pathname.startsWith("/api/files");
      if (!isConsultantPath && !isAuthApiRoute) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/consultant/dashboard", request.url));
      }
    } else {
      // Admin/Staff users
      const isVendorPortal = pathname === "/vendor" || pathname.startsWith("/vendor/") || pathname === "/api/vendor" || pathname.startsWith("/api/vendor/");
      const isConsultantPortal = pathname === "/consultant" || pathname.startsWith("/consultant/") || pathname === "/api/consultant" || pathname.startsWith("/api/consultant/");
      
      if ((isVendorPortal || isConsultantPortal) && !isAuthApiRoute) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
