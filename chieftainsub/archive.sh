#!/bin/bash

ARCHIVE=chieftainsub-$(git rev-parse --short HEAD).zip
rm chieftainsub-*.zip
zip -r "$ARCHIVE" . -x go.mod
echo "archived: $ARCHIVE"
