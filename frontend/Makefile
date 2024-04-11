

.PHONY: build

dev:
	docker run -it -p 2001:2001 -v "$(shell pwd)/../:/build" --entrypoint bash --rm node:10  -c "cd /build/frontend && yarn install && yarn run start --env.port=2001"