export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["web", "api", "root", "deps", "ci", "docs"]],
    "header-max-length": [2, "always", 300],
  },
};
