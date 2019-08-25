#!/bin/bash
set -e
source ../scripts/deploy.sh

BUCKET_DST="gs://cloudfunction-artifacts/chieftainapi"
NAME=chieftain-api


ARCHIVE="$(archive)"
echo "Archived sources in $ARCHIVE"

UPLOAD=$(upload "$ARCHIVE" "$BUCKET_DST")
echo "Uploaded sources to $UPLOAD"

deploy "$NAME" "$UPLOAD"
echo "Deployed $NAME with $ARCHIVE"