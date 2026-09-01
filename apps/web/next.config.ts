import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  transpilePackages: ["@esmeralda/database"],
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
