import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // React Hooks — rules-of-hooks, exhaustive-deps (+ compiler rules in v7)
  reactHooks.configs.flat["recommended-latest"],
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    settings: {
      next: {
        rootDir: "apps/web",
      },
    },
  },
  {
    rules: {
      // Disallow console.log/debug/info; allow warn/error for real issues
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  prettierConfig,
]);

export default eslintConfig;
