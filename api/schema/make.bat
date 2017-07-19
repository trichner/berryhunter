echo "Building Go bindings."
rmdir /s /q "./DeathioApi"
flatc -g common.fbs client.fbs server.fbs

echo "Building JavaScript bindings."
rmdir /s /q "./js"
flatc --js -o js/ common.fbs client.fbs server.fbs

echo "Bindings updated."
