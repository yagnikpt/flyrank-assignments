import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	cacheComponents: true,
	reactStrictMode: false,
};

export default nextConfig;
