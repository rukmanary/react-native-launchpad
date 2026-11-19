#!/bin/sh
set -eu

destination="$TARGET_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/GoogleService-Info.plist"
if [ "${STARTER_FIREBASE_ENABLED:-NO}" != "YES" ]; then
  rm -f "$destination"
  exit 0
fi

source="$SRCROOT/Firebase/$STARTER_FLAVOR/GoogleService-Info.plist"
if [ ! -f "$source" ]; then
  echo "error: Add ios/Firebase/$STARTER_FLAVOR/GoogleService-Info.plist for $PRODUCT_BUNDLE_IDENTIFIER" >&2
  exit 1
fi
registered_id=$(/usr/libexec/PlistBuddy -c 'Print :BUNDLE_ID' "$source")
if [ "$registered_id" != "$PRODUCT_BUNDLE_IDENTIFIER" ]; then
  echo "error: Firebase registration must match $PRODUCT_BUNDLE_IDENTIFIER" >&2
  exit 1
fi
mkdir -p "$(dirname "$destination")"
cp "$source" "$destination"
