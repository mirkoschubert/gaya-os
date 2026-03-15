#!/usr/bin/env zsh
# ─────────────────────────────────────────────────────────────
# release.sh – Create a GitHub release from CHANGELOG.md
#
# Usage:  pnpm release
# ─────────────────────────────────────────────────────────────

set -euo pipefail

CHANGELOG="CHANGELOG.md"
PACKAGE_JSON="package.json"

# ── 1. Read latest version from CHANGELOG ────────────────────

CHANGELOG_VERSION=$(grep -m1 '## \[[0-9]' "$CHANGELOG" | sed 's/.*\[\([^]]*\)\].*/\1/')

if [[ -z "$CHANGELOG_VERSION" ]]; then
  echo "❌ No versioned entry found in $CHANGELOG (expected: ## [x.y.z])"
  exit 1
fi

# ── 2. Check version matches package.json ────────────────────

PACKAGE_VERSION=$(node -p "require('./$PACKAGE_JSON').version")

if [[ "$CHANGELOG_VERSION" != "$PACKAGE_VERSION" ]]; then
  echo "❌ Version mismatch:"
  echo "   CHANGELOG.md → $CHANGELOG_VERSION"
  echo "   package.json → $PACKAGE_VERSION"
  echo ""
  echo "   Update package.json to match CHANGELOG or add a new CHANGELOG entry."
  exit 1
fi

TAG="v${CHANGELOG_VERSION}"

# ── 3. Check tag doesn't already exist ───────────────────────

if git tag | grep -q "^${TAG}$"; then
  echo "❌ Tag $TAG already exists. Bump the version first."
  exit 1
fi

# ── 4. Check working tree is clean ───────────────────────────

if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Working tree is not clean. Commit or stash your changes first."
  git status --short
  exit 1
fi

# ── 5. Extract release notes from CHANGELOG ──────────────────
# Everything between the first versioned ## header and the next one

RELEASE_NOTES=$(awk "
  /^## \[${CHANGELOG_VERSION}\]/ { found=1; next }
  found && /^## \[/ { exit }
  found { print }
" "$CHANGELOG" | sed '/^$/d' | sed '1{/^$/d}')

if [[ -z "$RELEASE_NOTES" ]]; then
  echo "❌ No release notes found for version $CHANGELOG_VERSION in $CHANGELOG"
  exit 1
fi

# ── 6. Confirm ───────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Release: $TAG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RELEASE_NOTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -n "Create and publish release $TAG? [y/N] "
read -r CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# ── 7. Push current branch ───────────────────────────────────

echo ""
echo "→ Pushing current branch..."
git push

# ── 8. Create GitHub release (triggers deploy workflow) ──────

echo "→ Creating GitHub release $TAG..."
gh release create "$TAG" \
  --title "$TAG" \
  --notes "$RELEASE_NOTES"

echo ""
echo "✅ Release $TAG published. GitHub Actions will deploy to Vercel shortly."
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
