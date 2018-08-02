#!/bin/bash

TAG="$1"
if [[ -z "$TAG" ]];then
    GIT_TAG="rev-$(git rev-parse HEAD | cut -c 1-7)"
    TAG=$GIT_TAG
fi

REGISTRY_NAMESPACE="gcr.io/trichner-212015/"
echo "Building berryhunterd:$TAG"
IMAGE_NAME="berryhunterd"
docker build -t "$IMAGE_NAME:$TAG"  .


docker tag "$IMAGE_NAME:$TAG" "$IMAGE_NAME:latest"
docker tag "$IMAGE_NAME:$TAG" "gcr.io/trichner-212015/$IMAGE_NAME:$TAG"

printf "\ntagged:\n   %s\n   %s\n" "$IMAGE_NAME:latest" "gcr.io/trichner-212015/$IMAGE_NAME:$TAG"
