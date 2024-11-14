// next.config.mjs

import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";
import nextMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import { readFileSync } from "fs";

const catppuccinLatteTheme = JSON.parse(
  readFileSync(
    new URL("./public/themes/catppuccin-latte.json", import.meta.url)
  )
);

const darkPlusTheme = JSON.parse(
  readFileSync(new URL("./public/themes/dark-plus.json", import.meta.url))
);

/** @type {import('rehype-pretty-code').Options} */
const options = {
  // See Options section below.
  theme: {
    dark: "vitesse-black",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: {
    block: "py",
    inline: "plaintext",
  },
  bypassInlineCode: true,
  filterMetaString: (string) => string.replace(/filename="[^"]*"/, ""),
  // onVisitLine(element) {
  //   console.log("Visited line");
  // },
  // onVisitHighlightedLine(element) {
  //   console.log("Visited highlighted line");
  // },
  // onVisitHighlightedChars(element) {
  //   console.log("Visited highlighted chars");
  // },
  // onVisitTitle(element) {
  //   console.log("Visited title");
  // },
  // onVisitCaption(element) {
  //   console.log("Visited caption");
  // },
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [[rehypePrettyCode, options]],
  },
});

// 配置 bundle 分析和 PWA
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const pwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {},

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      // We're in the browser build, so we can safely exclude the sharp module
      config.externals.push("sharp");
    }
    // This is the asset module.
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });

    // audio support
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: "url-loader",
          options: {
            limit: config.inlineImageLimit,
            fallback: "file-loader",
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"],
    });

    return config;
  },
};

const KEYS_TO_OMIT = [
  "webpackDevMiddleware",
  "configOrigin",
  "target",
  "analyticsId",
  "webpack5",
  "amp",
  "assetPrefix",
];

const createConfig = async (_phase, { defaultConfig }) => {
  const plugins = [[pwa], [bundleAnalyzer, {}]];

  const wConfig = plugins.reduce(
    (acc, [plugin, config]) => plugin({ ...acc, ...config }),
    {
      ...defaultConfig,
      ...nextConfig,
    }
  );

  const finalConfig = {};
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key];
    }
  });

  return withSentryConfig(withMDX(finalConfig), {
    org: "nchu-is",
    project: "javascript-nextjs",
    sentryUrl: "https://sentry.io/",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  });
};

export default createConfig;
