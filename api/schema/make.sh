#!/bin/bash

echo "Building Go bindings."
rm -rf "./BerryhunterApi"
flatc -g *.fbs

echo "Building JavaScript bindings."
rm -rf "./js"
flatc --js -o js/ *.fbs

echo "Bindings updated."
