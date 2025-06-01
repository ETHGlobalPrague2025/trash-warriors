import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS: process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS,
    NEXT_PUBLIC_TEST_USDC_ADDRESS: process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS,
    NEXT_PUBLIC_FLOW_TESTNET_CHAIN_ID: process.env.NEXT_PUBLIC_FLOW_TESTNET_CHAIN_ID,
    NEXT_PUBLIC_FLOW_TESTNET_RPC: process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC,
    NEXT_PUBLIC_ZKP_API_URL: process.env.NEXT_PUBLIC_ZKP_API_URL,
  },
};

export default nextConfig;
