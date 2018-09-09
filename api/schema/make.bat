echo "Building Go bindings."
rmdir /s /q "./BerryhunterApi"
flatc -go common.fbs client.fbs server.fbs

echo "Building JavaScript bindings."
rmdir /s /q "./js"
flatc --js --gen-onefile -o js/  common.fbs client.fbs server.fbs

echo "Bindings updated."
