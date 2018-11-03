

TARGET=berryhunterd chieftaind berryhunter-web berryhunter-edge
TARGET_BUILD=$(addsuffix .build, $(TARGET))
TARGET_TAG=$(addsuffix .tag, $(TARGET))
TARGET_PUSH=$(addsuffix .push, $(TARGET))
TAG?="r$(shell git rev-parse HEAD | head -c 7)"

all: $(TARGET_BUILD)

tag: $(TARGET_TAG)

push: $(TARGET_PUSH)

.PHONY: $(TARGET_BUILD)
$(TARGET_BUILD) : %.build:
	@echo building $*
	@docker build -t $* -f Dockerfile.$* .

.PHONY: $(TARGET_TAG)
$(TARGET_TAG) : %.tag:
	@echo tagging $*
	@docker tag $* gcr.io/trichner-212015/$*:$(TAG)

.PHONY: $(TARGET_PUSH)
$(TARGET_PUSH) : %.push: %.tag
	@echo pushing $*
	@docker push gcr.io/trichner-212015/$*:$(TAG)

.PHONY: berryhunterd chieftaind berryhunter-web all
