

.PHONY: dev build gen fmt

build: berryhunterd.build

gen:
	@go generate ./...

fmt:
	@gofumpt -l -w .

cp-defs:
	$(info "bundling items and mobs definitions")
	@find ./pkg/api -type f -name '*.json' -delete
	@cp -rf ../api/items ../api/mobs ./pkg/api

%.build: cp-defs
	go build -o $* ./cmd/$*

dev: berryhunterd.dev

%.dev: cp-defs
	go run ./cmd/$* -dev
