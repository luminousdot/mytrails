import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, type Locale } from "./i18n/config";

// Every page lives under /sr or /en. A path without one is sent to the
// language the visitor chose before (cookie); else Serbian for browsers set to a
// language of the region (sr, hr, bs, sh, cnr) or none, English for the rest.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1] ?? "";
  if (hasLocale(segment)) {
    const res = NextResponse.next();
    if (request.cookies.get("lang")?.value !== segment) res.cookies.set("lang", segment, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  const saved = request.cookies.get("lang")?.value;
  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const regional = first === "" || /^(sr|hr|bs|sh|cnr|me)\b/.test(first);
  const lang: Locale = saved && hasLocale(saved) ? saved : regional ? defaultLocale : "en";
  request.nextUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Not for Next internals, uploads, GPX files or anything with a file extension.
  matcher: ["/((?!_next|uploads|gpx|.*\\..*).*)"],
};
