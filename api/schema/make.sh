#!/bin/bash

echo "Building Go bindings."
rm -rf "./BerryhunterApi"
flatc --go *.fbs

echo "Building JavaScript bindings."
rm -rf "./js"
flatc --ts --gen-all --no-fb-import --no-ts-reexport -o js/ berryhunterApi.fbs

echo "Bindings updated."
