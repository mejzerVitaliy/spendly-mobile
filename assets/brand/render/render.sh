#!/usr/bin/env bash
# Renders an SVG to a square PNG at a given size via headless Chrome (needed
# for backdrop-filter/foreignObject support that plain SVG rasterizers don't
# have). Usage: render.sh <svg-file> <size-px> <out-png>
set -euo pipefail
SVG="$1"
SIZE="$2"
OUT="$3"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML="$DIR/_tmp_render.html"

{
  echo '<!DOCTYPE html><html><head><style>*{margin:0;padding:0}body{width:'"${SIZE}"'px;height:'"${SIZE}"'px;background:transparent}svg{width:'"${SIZE}"'px;height:'"${SIZE}"'px;display:block}</style></head><body>'
  cat "$SVG"
  echo '</body></html>'
} > "$HTML"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu \
  --screenshot="$OUT" \
  --window-size="${SIZE},${SIZE}" \
  --default-background-color=00000000 \
  "file://$HTML" > /dev/null 2>&1

rm -f "$HTML"
echo "rendered $OUT (${SIZE}x${SIZE})"
