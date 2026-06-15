#!/usr/bin/env sh
set -e

# Green success line (works in most terminals)
print_success() {
  printf '\033[32m✓ %s\033[0m\n' "$1"
}

# Block direct commits on integration branches; allow feat/*, fix/*, release/x.y.z, etc.
BRANCH="$(git branch --show-current 2>/dev/null || true)"

if [ -z "$BRANCH" ]; then
  echo "⚠️  Not on a named branch (detached HEAD). Skipping branch name check."
  exit 0
fi

WORK_PATTERN='^(feat|fix|refactor|tests|chore|docs|ci|hotfix|perf|revert)/[a-z0-9]+(-[a-z0-9]+)*$'
RELEASE_PATTERN='^release/[0-9]+\.[0-9]+\.[0-9]+$'

# Long-lived integration branches — no direct commits
PROTECTED_PATTERN='^(main|master|develop|staging|release/next)$'

if printf '%s\n' "$BRANCH" | grep -Eq "$PROTECTED_PATTERN"; then
  echo "❌ Direct commits to \"$BRANCH\" are not allowed."
  echo ""
  echo "Create a branch from $BRANCH, commit there, then open a PR:"
  echo "  git checkout -b feat/your-kebab-case-description"
  echo "  git checkout -b release/0.0.3"
  exit 1
fi

if printf '%s\n' "$BRANCH" | grep -Eq "$WORK_PATTERN" || \
   printf '%s\n' "$BRANCH" | grep -Eq "$RELEASE_PATTERN"; then
  print_success "Branch name validation successful ($BRANCH)"
  exit 0
fi

echo "❌ Invalid branch name: \"$BRANCH\""
echo ""
echo "Use one of:"
echo "  <type>/<kebab-case-description>"
echo "    Types: feat, fix, refactor, tests, chore, docs, ci, hotfix, perf, revert"
echo "    Slug:  lowercase letters, numbers, hyphens only (no underscores)"
echo "  release/x.y.z  (semver, e.g. release/0.0.3, release/0.0.4)"
echo ""
echo "Examples:"
echo "  feat/add-user-recommendations"
echo "  fix/handle-empty-cart"
echo "  release/0.0.3"
echo ""
echo "No direct commits on: main, master, develop, staging, release/next"
echo ""
echo "Rename this branch (run locally; hooks are not enforced on the server):"
echo "  git branch -m $BRANCH feat/your-kebab-case-description"
echo "  # already on \"$BRANCH\"? omit the old name:"
echo "  git branch -m feat/your-kebab-case-description"
echo ""
echo "If you already pushed \"$BRANCH\" to the remote:"
echo "  git branch -m feat/your-kebab-case-description"
echo "  git push origin -u feat/your-kebab-case-description"
echo "  git push origin --delete $BRANCH"
exit 1