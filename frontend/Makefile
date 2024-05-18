

.PHONY: build dev

dev:
	docker run -it -p 2001:2001 -v "$(shell pwd)/../:/build" --entrypoint bash --rm node:20  -c "cd /build/frontend && npm install && npm run start -- --env port=2001"

# run the build with `node` from a Dockerimage, it breaks way too often
build:
	docker run -it -v "$(shell pwd)/../:/build" --entrypoint bash --rm node:20  -c "cd /build/frontend && npm install && npm run build"
