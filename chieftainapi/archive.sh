#!/bin/bash

ARCHIVE=chieftainapi-$(git rev-parse --short HEAD).zip
rm chieftainapi-*.zip
zip -r "$ARCHIVE" . -x go.mod
echo "archived: $ARCHIVE"
