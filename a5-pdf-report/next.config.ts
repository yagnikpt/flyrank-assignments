import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	reactStrictMode: false,
	// Playwright launches a real browser binary; it must not be bundled.
	serverExternalPackages: ["playwright"],
};

export default nextConfig;
