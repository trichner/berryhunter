echo "Building JavaScript bindings."
rmdir /s /q "./js"
flatc --ts --gen-all --no-fb-import --no-ts-reexport -o js/ berryhunter.fbs

echo "update the backend bindings by running 'go generate ./...' in backend/"

echo "Bindings updated."
