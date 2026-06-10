import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (host.includes("vercel.app")) {
    const newUrl =
      "https://www.goldlq.com" +
      request.nextUrl.pathname +
      request.nextUrl.search;
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
