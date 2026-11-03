/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = [
    {
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000",
    },
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self), payment=()",
    },
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'self'",
            "form-action 'self' https:",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https:",
            "style-src 'self' 'unsafe-inline' https:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
            "connect-src 'self' https: wss:",
            "frame-src 'self' https:",
            "upgrade-insecure-requests",
        ].join("; "),
    },
];

const nextConfig = {
    poweredByHeader: false,
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: "/:path*",
                headers: isProduction
                    ? securityHeaders
                    : securityHeaders.filter(
                        (header) =>
                            header.key !== "Strict-Transport-Security"
                    ),
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "property-images.zohostratus.in",
            },
        ],
    },
};
export default nextConfig;