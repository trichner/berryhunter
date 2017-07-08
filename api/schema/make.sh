#!/bin/bash

echo "Building Go bindings."
flatc -g *.fbs

echo "Building JavaScript bindings."
flatc --js -o js/ *.fbs

echo "Bindings updated."
