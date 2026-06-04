#!/usr/bin/env bash
# Usage: ./scripts/bump.sh <new-version>
# Syncs VERSION file + all package.json / Cargo.toml, then creates git tags.
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>  (e.g. 1.2.0)" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "$VERSION" > "$REPO_ROOT/VERSION"
echo "→ VERSION = $VERSION"

# ── JavaScript package.json ──────────────────────────────────────────────────
JS_PKGS=(
  javascript/auth
  javascript/auth-native
  javascript/auth-dx
  javascript/address-layout
)
for pkg in "${JS_PKGS[@]}"; do
  file="$REPO_ROOT/$pkg/package.json"
  node -e "
    const fs = require('fs');
    const p = JSON.parse(fs.readFileSync('$file', 'utf8'));
    p.version = '$VERSION';
    fs.writeFileSync('$file', JSON.stringify(p, null, 2) + '\n');
  "
  echo "→ $pkg/package.json = $VERSION"
done

# ── Rust Cargo.toml ───────────────────────────────────────────────────────────
RUST_PKGS=(
  rust/auth
  rust/auth-native
  rust/auth-core
)
for pkg in "${RUST_PKGS[@]}"; do
  file="$REPO_ROOT/$pkg/Cargo.toml"
  # Replace the first `version = "..."` line (the [package] version)
  sed -i "0,/^version = \"[^\"]*\"/s//version = \"$VERSION\"/" "$file"
  echo "→ $pkg/Cargo.toml = $VERSION"
done

# ── Git tags ──────────────────────────────────────────────────────────────────
echo ""
echo "Creating git tags:"
TAGS=(
  "auth-v$VERSION"
  "auth-native-v$VERSION"
  "auth-dx-v$VERSION"
  "address-layout-v$VERSION"
  "binrc-auth-v$VERSION"
  "binrc-auth-native-v$VERSION"
  "binrc-auth-core-v$VERSION"
  "go/auth-v$VERSION"
  "go/auth-native-v$VERSION"
  "go/auth-core-v$VERSION"
)
for tag in "${TAGS[@]}"; do
  git tag "$tag"
  echo "  tagged: $tag"
done

echo ""
echo "Push tags (npm workflow triggers on auth*-v* only):"
echo "  git push origin ${TAGS[*]}"
