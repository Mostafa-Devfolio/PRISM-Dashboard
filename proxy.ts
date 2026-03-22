import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getLogin } from "./app/[locale]/auth/login/login";

export default createMiddleware(routing);
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const token = await getLogin();
  const pathname = request.nextUrl.pathname;
  const isProtectedPath = ["/admin"].some((path) => pathname.includes(path));
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/locked", request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
