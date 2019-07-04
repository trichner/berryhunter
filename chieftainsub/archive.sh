#!/bin/bash

ARCHIVE=chieftainsub-$(git rev-parse --short HEAD).zip
zip -r "$ARCHIVE" . -x go.mod
