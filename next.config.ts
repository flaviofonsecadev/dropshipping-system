import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    'run-agent-69d30e26712cd4622d9d3f41-mnmirzuq-preview.agent-sandbox-my-b1-gw.trae.ai',
    '*.agent-sandbox-my-b1-gw.trae.ai'
  ],
};

export default nextConfig;
