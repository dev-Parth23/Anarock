
/** @type {import('next').NextConfig} */

const securityHeaders = [
    {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
    },
    {
        key: "Content-Security-Policy",
        value:
            "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    },
];

const nextConfig = {
    poweredByHeader: false,

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "property-images.zohostratus.in",
                pathname: "/**",
            },
        ],

        formats: ["image/avif", "image/webp"],
    },

    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
