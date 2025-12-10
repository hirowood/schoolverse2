import path from "node:path";

const rootDir = path.dirname(new URL(import.meta.url).pathname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@excalidraw/excalidraw"],
  outputFileTracingRoot: rootDir,
};

export default nextConfig;
