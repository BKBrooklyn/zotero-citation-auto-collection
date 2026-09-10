#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUTPUT="$SCRIPT_DIR/citation-auto-collection-1.0.2.xpi"

cd "$SCRIPT_DIR"
zip -q "$OUTPUT" manifest.json bootstrap.js citation-auto-collection.js prefs.js \
	icons/icon-48.png icons/icon-96.png icons/icon-128.png
printf '%s\n' "$OUTPUT"
