import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./app/i18n/settings";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: true,
});

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
