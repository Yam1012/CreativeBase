import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");
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
    // 無効化されたアカウントはログインページに送り返す
    if (role === "cancelled") {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("disabled", "1");
      return NextResponse.redirect(loginUrl);
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
