#!/bin/bash

function archive {
	local ARCHIVE=chieftainapi-rev-$(git rev-parse --short HEAD).zip
	rm -f chieftainapi-*.zip
	go mod vendor
	zip -r "$ARCHIVE" . -x go.mod >&2 
	echo "$(pwd)/$ARCHIVE"
}

function upload {
	local SRC="$1"
	local DST="$2"
	gsutil cp "$ARCHIVE" "$DST"
	echo "$BUCKET_DST/$(basename $SRC)"
}

function deploy {
	local NAME="$1"
	local SRC="$2"
	gcloud functions deploy "$NAME" --source "$UPLOAD" --region "europe-west1"
}