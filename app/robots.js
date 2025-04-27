// Génération du robots.txt pour Next.js
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/checkout/",
        "/account/",
        "/cart",
        "/*.json$",
      ],
    },
    sitemap: "https://www.example.com/sitemap.xml",
  };
}
