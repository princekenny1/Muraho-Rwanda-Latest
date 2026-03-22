import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "minio", port: "9000" },
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
};

export default withPayload(nextConfig);
