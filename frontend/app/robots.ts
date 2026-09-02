import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabieq.in";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/order", "/delivery"],
                disallow: [
                    "/admin",
                    "/admin/*",
                    "/captain",
                    "/api/*",
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
