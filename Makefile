

TARGET=berryhunterd chieftaind berryhunter-web berryhunter-edge
TARGET_BUILD=$(addsuffix .build, $(TARGET))
TARGET_TAG=$(addsuffix .tag, $(TARGET))
TARGET_PUSH=$(addsuffix .push, $(TARGET))
TAG?="rev-$(shell git rev-parse HEAD | head -c 7)"
DOCKER_REPO="gcr.io/berryhunter-io"

all: build

.PHONY: build.frontend build.backend

build: build.frontend build.backend

build.backend: build.frontend

build.backend:
	$(MAKE) -C backend build

build.frontend:
	$(MAKE) -C frontend build

tag: $(TARGET_TAG)

push: $(TARGET_PUSH)

.PHONY: $(TARGET_BUILD)
$(TARGET_BUILD) : %.build:
	@echo building $*
	@docker build -t $* -f Dockerfile.$* .

.PHONY: $(TARGET_TAG)
$(TARGET_TAG) : %.tag:
	@echo tagging $*
	@docker tag $* $(DOCKER_REPO)/$*:$(TAG)

.PHONY: $(TARGET_PUSH)
$(TARGET_PUSH) : %.push: %.tag
	@echo pushing $*
	@docker push $(DOCKER_REPO)/$*:$(TAG)

.PHONY: berryhunterd chieftaind berryhunter-web all
