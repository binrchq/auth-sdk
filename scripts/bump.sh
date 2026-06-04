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
echo "Creating git tags (run from inside the auth-sdk repo):"
TAGS=(
  "@binrc/auth@$VERSION"
  "@binrc/auth-native@$VERSION"
  "@binrc/auth-dx@$VERSION"
  "@binrc/address-layout@$VERSION"
  "binrc-auth@$VERSION"
  "binrc-auth-native@$VERSION"
  "binrc-auth-core@$VERSION"
  "auth-sdk/go/auth@$VERSION"
  "auth-sdk/go/auth-native@$VERSION"
  "auth-sdk/go/auth-core@$VERSION"
)
for tag in "${TAGS[@]}"; do
  git tag "$tag"
  echo "  tagged: $tag"
done

echo ""
echo "Done. Push tags with:"
echo "  git push origin ${TAGS[*]}"
