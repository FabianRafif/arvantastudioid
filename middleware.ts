import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("arvanta_session")?.value;

  // Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const payload = JSON.parse(atob(parts[1])) as { role?: string; exp?: number };
      if (!payload || !payload.role || !["SUPER_ADMIN", "ADMIN"].includes(payload.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect Customer Dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
