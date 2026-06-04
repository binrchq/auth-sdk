#!/usr/bin/env bash
# Usage: ./scripts/bump.sh <version>  e.g. 1.2.0
set -euo pipefail

VERSION="${1:-}"
[[ -z "$VERSION" ]] && { echo "Usage: $0 <version>"; exit 1; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "$VERSION" > "$REPO_ROOT/VERSION"

for pkg in javascript/auth javascript/auth-native javascript/auth-dx javascript/address-layout; do
  node -e "
    const fs = require('fs'), f = '$REPO_ROOT/$pkg/package.json';
    const p = JSON.parse(fs.readFileSync(f, 'utf8'));
    p.version = '$VERSION';
    fs.writeFileSync(f, JSON.stringify(p, null, 2) + '\n');
  "
  echo "→ $pkg @ $VERSION"
done

for pkg in rust/auth rust/auth-native rust/auth-core; do
  sed -i "0,/^version = \"[^\"]*\"/s//version = \"$VERSION\"/" "$REPO_ROOT/$pkg/Cargo.toml"
  echo "→ $pkg @ $VERSION"
done

git add -A
git commit -m "chore: release v$VERSION"
git tag "v$VERSION"
echo ""
echo "Run: git push && git push origin v$VERSION"
