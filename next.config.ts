import createBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import os from "node:os";

type BuildAsset = {
  name: string;
  size?: number;
};

type WebpackStats = {
  toJson(options: { all: false; assets: true }): {
    assets?: BuildAsset[];
  };
};

type WebpackCompiler = {
  hooks: {
    done: {
      tap(name: string, callback: (stats: WebpackStats) => void): void;
    };
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getAllowedDevOrigins() {
  const ipv4Hosts = Object.values(os.networkInterfaces())
    .flat()
    .filter(
      (details): details is NonNullable<typeof details> =>
        !!details && details.family === "IPv4" && !details.internal
    )
    .map((details) => details.address);

  const hostname = os.hostname().toLowerCase();
  const lanHostname = hostname.endsWith(".local") ? hostname : `${hostname}.local`;
  const envHosts = (process.env.ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...ipv4Hosts, hostname, lanHostname, ...envHosts]));
}

const nextConfig: NextConfig = {
  distDir: "dist",
  allowedDevOrigins: getAllowedDevOrigins(),
  // 生产构建时自动剥离所有 console.* 调用（dev 保留，不影响本地调试）
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  devIndicators: false,
  logging: { browserToTerminal: false },
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_TITLE: process.env.NEXT_PUBLIC_SITE_TITLE,
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION ?? String(Date.now()),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/main/:path*",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/jump",
        destination: "/en/jump",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
};

const originalWebpack = nextConfig.webpack;
nextConfig.webpack = (config, options) => {
  if (options.dev && !options.isServer) {
    // 开发环境优先可调试性，使用更精确的 source map 映射源码文件和行号。
    config.devtool = "source-map";
  }

  if (!options.isServer && config.optimization?.splitChunks) {
    const cacheGroups = config.optimization.splitChunks.cacheGroups ?? {};

    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...cacheGroups,
        vendorAxios: {
          name: "vendor-axios",
          test: /[\\/]node_modules[\\/](?:\.pnpm[\\/])?axios(?:@[^\\/]+)?[\\/]/,
          chunks: "all",
          priority: 40,
          enforce: true,
        },
        vendorDecimal: {
          name: "vendor-decimal",
          test: /[\\/]node_modules[\\/](?:\.pnpm[\\/])?decimal\.js(?:@[^\\/]+)?[\\/]/,
          chunks: "all",
          priority: 40,
          enforce: true,
        },
        vendorSonner: {
          name: "vendor-sonner",
          test: /[\\/]node_modules[\\/](?:\.pnpm[\\/])?sonner(?:@[^\\/]+)?[\\/]/,
          chunks: "all",
          priority: 40,
          enforce: true,
        },
        vendorReactQuery: {
          name: "vendor-react-query",
          test: /[\\/]node_modules[\\/](?:\.pnpm[\\/])?@tanstack\+(?:query-core|react-query)(?:@[^\\/]+)?[\\/]/,
          chunks: "all",
          priority: 40,
          enforce: true,
        },
        vendorUiBase: {
          name: "vendor-ui-base",
          test: /[\\/]node_modules[\\/](?:\.pnpm[\\/])?(?:lucide-react|tailwind-merge)(?:@[^\\/]+)?[\\/]/,
          chunks: "all",
          priority: 40,
          enforce: true,
        },
        vendorBuffer: {
          name: "vendor-buffer",
          test: /[\\/]node_modules[\\/](?:\.pnpm[\\/])?(?:buffer|base64-js|ieee754)(?:@[^\\/]+)?[\\/]/,
          chunks: "all",
          priority: 40,
          enforce: true,
        },
      },
    };
  }

  return originalWebpack ? originalWebpack(config, options) : config;
};

if (process.env.PRINT_BUILD_ASSETS === "true") {
  const previousWebpack = nextConfig.webpack;
  nextConfig.webpack = (config, options) => {
    const nextWebpackConfig = previousWebpack ? previousWebpack(config, options) : config;

    const { isServer } = options;
    nextWebpackConfig.plugins.push({
      apply(compiler: WebpackCompiler) {
        compiler.hooks.done.tap("PrintBuildAssetsPlugin", (stats) => {
          const assets = stats
            .toJson({ all: false, assets: true })
            .assets?.filter((asset) => /\.(js|css|map)$/.test(asset.name))
            .sort((a, b) => (b.size ?? 0) - (a.size ?? 0));

          if (!assets?.length) return;

          console.log(`\nBuild assets (${isServer ? "server" : "client"}):`);
          for (const asset of assets) {
            console.log(`${formatBytes(asset.size ?? 0).padStart(10)}  ${asset.name}`);
          }
        });
      },
    });

    return nextWebpackConfig;
  };
}

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
