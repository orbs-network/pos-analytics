#!/bin/sh
# Dev helper: build the sibling pos-analytics-lib checkout and copy its dist into this
# app's node_modules, so lib changes (feature/speed-cache) can be tested here before a
# new @orbs-network/pos-analytics-lib version is published to npm.
# NOTE: `yarn install` wipes this - re-run afterwards. Restart `yarn start` to pick it up.
set -e
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$APP_DIR/../pos-analytics-lib"

if [ ! -d "$LIB_DIR/src" ]; then
    echo "pos-analytics-lib checkout not found at $LIB_DIR" >&2
    exit 1
fi

cd "$LIB_DIR"
npm run build

rm -rf "$APP_DIR/node_modules/@orbs-network/pos-analytics-lib/dist"
cp -R "$LIB_DIR/dist" "$APP_DIR/node_modules/@orbs-network/pos-analytics-lib/dist"
echo "Synced $LIB_DIR/dist -> node_modules/@orbs-network/pos-analytics-lib/dist"
echo "Restart 'yarn start' to pick up the change."
