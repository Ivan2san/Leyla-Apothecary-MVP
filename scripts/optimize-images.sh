#!/bin/bash

# Batch convert JPG/PNG assets in public/images to optimized WebP variants.
# Mirrors the automation checklist in docs/VISUAL_CONTENT_SYSTEM.md.

set -euo pipefail

if ! command -v cwebp >/dev/null 2>&1; then
  echo "❌ cwebp is required. Install via 'brew install webp' or your package manager."
  exit 1
fi

shopt -s globstar nullglob

for img in public/images/**/*.{jpg,jpeg,png}; do
  filename="${img%.*}"
  output="${filename}.webp"

  echo "Optimizing $img -> $output"
  cwebp -quiet -q 85 "$img" -o "$output"
done

echo "✅ Image optimization complete."
