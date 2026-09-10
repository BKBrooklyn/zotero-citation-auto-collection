#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUTPUT="$SCRIPT_DIR/citation-auto-collection-0.1.3.xpi"

cd "$SCRIPT_DIR"
zip -q "$OUTPUT" manifest.json bootstrap.js citation-auto-collection.js prefs.js
printf '%s\n' "$OUTPUT"
