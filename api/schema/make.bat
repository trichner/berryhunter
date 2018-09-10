echo "Building Go bindings."
rmdir /s /q "./BerryhunterApi"
flatc --go common.fbs client.fbs server.fbs

echo "Building JavaScript bindings."
rmdir /s /q "./js"
flatc --ts -o js/  common.fbs client.fbs server.fbs
REM flatc --js -o js/  common.fbs client.fbs server.fbs

echo "Bindings updated."
