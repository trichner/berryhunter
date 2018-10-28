

TARGET=berryhunterd chieftaind berryhunter-web
TARGET_BUILD=$(addsuffix .build, $(TARGET))
TARGET_TAG=$(addsuffix .tag, $(TARGET))
TAG?=latest

all: $(TARGET_BUILD)

tag: $(TARGET_TAG)

.PHONY: $(TARGET_BUILD)
$(TARGET_BUILD) : %.build:
	@echo building $*
	@docker build -t $* -f Dockerfile.$* .

.PHONY: $(TARGET_TAG)
$(TARGET_TAG) : %.tag:
	@echo tagging $*
	@docker tag $* gcr.io/trichner-212015/$*:$(TAG)

.PHONY: berryhunterd chieftaind berryhunter-web all