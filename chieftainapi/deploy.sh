#!/bin/bash
set -e

BUCKET_DST="gs://cloudfunction-artifacts/chieftainapi"
NAME=chieftain-api
RUNTIME=go111

function archive {
	local ARCHIVE=chieftainapi-$(git rev-parse --short HEAD).zip
	rm -f chieftainapi-*.zip
	go mod vendor
	zip -r "$ARCHIVE" . -x go.mod >&2 
	echo "$(pwd)/$ARCHIVE"
}

function upload {
	local SRC="$1"
	gsutil cp "$ARCHIVE" "$BUCKET_DST"
	echo "$BUCKET_DST/$(basename $SRC)"
}


ARCHIVE="$(archive)"
echo "Archived sources in $ARCHIVE"

UPLOAD=$(upload "$ARCHIVE")
echo "Uploaded sources to $UPLOAD"

gcloud functions deploy "$NAME" --source "$UPLOAD" --region "europe-west1"