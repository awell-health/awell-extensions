#!/usr/bin/env bash
# Deterministic enforcement of repo conventions from SKILL.md and PR-CONVENTIONS.md.
# Prompts are probabilistic; this script is deterministic. Runs in CI via
# .github/workflows/conventions.yml on every PR, so `git commit --no-verify`
# cannot bypass it.
#
# Usage:
#   .github/scripts/check-repo-conventions.sh               # uses staged changes (--cached)
#   .github/scripts/check-repo-conventions.sh <diff-range>  # e.g. "origin/main...HEAD"
set -euo pipefail

DIFF_RANGE="${1:---cached}"
ROOT_PACKAGE_JSON="package.json"
EXTENSIONS_DIR="extensions"

fail=0

# ---------------------------------------------------------------------------
# Check 1 — Block manual version bumps in root package.json
# CI (create-release.yml) auto-bumps patch on every merge to main. A manual
# bump in a PR conflicts and gets overwritten. See PR-CONVENTIONS.md §0/§10.
# ---------------------------------------------------------------------------
if git diff "$DIFF_RANGE" --name-only -- "$ROOT_PACKAGE_JSON" 2>/dev/null | grep -q .; then
  if git diff "$DIFF_RANGE" -U0 -- "$ROOT_PACKAGE_JSON" 2>/dev/null \
      | grep -E '^[+-][[:space:]]*"version"[[:space:]]*:' >/dev/null; then
    echo "❌ Blocked: do not bump the \"version\" field in $ROOT_PACKAGE_JSON."
    echo "   CI (create-release.yml) auto-bumps patch on every merge to main;"
    echo "   a manual bump conflicts and is overwritten."
    echo "   See PR-CONVENTIONS.md §0 and §10."
    fail=1
  fi
fi

# ---------------------------------------------------------------------------
# Check 2 — Block JSON manifest files at extension roots
# The TypeScript Extension object in extensions/<key>/index.ts IS the manifest.
# No *.json may live directly under extensions/<key>/. See SKILL.md §0.
# ---------------------------------------------------------------------------
added_files=$(git diff "$DIFF_RANGE" --name-only --diff-filter=A -- "$EXTENSIONS_DIR/" 2>/dev/null || true)
if [ -n "$added_files" ]; then
  json_manifests=$(echo "$added_files" | grep -E "^$EXTENSIONS_DIR/[^/]+/[^/]+\.json$" || true)
  if [ -n "$json_manifests" ]; then
    echo "❌ Blocked: JSON manifest files are not allowed at extension roots."
    echo "   The TypeScript Extension object in extensions/<key>/index.ts is the manifest."
    echo "   See SKILL.md §0."
    echo "   Offending file(s):"
    echo "$json_manifests" | sed 's/^/     - /'
    fail=1
  fi
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

exit 0
