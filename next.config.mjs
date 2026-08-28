/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Banner images now come from Tavily web search, so they can be hosted on
    // any domain. next/image requires an allowlist, and the set of hosts isn't
    // knowable up front, hence the wildcard.
    remotePatterns: [{ protocol: "https", hostname: "**" }],

    // Because the host allowlist is open, treat every remote image as
    // untrusted: no SVG (it can carry script), serve optimized output with a
    // sandboxed CSP, and never render it inline as a document.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
