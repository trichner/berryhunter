echo "Building Go bindings."
rmdir /s /q "./BerryhunterApi"
flatc --go common.fbs client.fbs server.fbs

echo "Building JavaScript bindings."
rmdir /s /q "./js"
flatc --ts --gen-all --no-fb-import --no-ts-reexport -o js/ berryhunterApi.fbs

echo "Bindings updated."
