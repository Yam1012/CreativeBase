import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();

  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/mypage", nextUrl));
    }
    return NextResponse.next();
  }

  if (nextUrl.pathname.startsWith("/mypage")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    const role = (session?.user as { role?: string })?.role;
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.next();
  }

  if (isAuthPage && isLoggedIn) {
    const role = (session?.user as { role?: string })?.role;
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/mypage", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
