export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["web", "bff", "api", "root", "deps", "ci", "docs", "bff:api"]],
    "header-max-length": [2, "always", 300],
  },
};
