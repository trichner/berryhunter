#!/bin/bash
# This script updates the backend and restarts it

# Shutdown old backend
screen -S berryhunterd -X quit

# Panic on error
set -e

# Get changes
git pull

# Rebuild chieftain binary
#pushd ./chieftaind/
#
#export GOPATH="/home/ubuntu/go"
#go get
#go build -a
#
#popd

# Rebuild backend binary
pushd ./berryhunterd/

export GOPATH="/home/ubuntu/go"
go get
go build -a

popd

# rebuild frontend
pushd ./frontend/

npm install
npm run build

popd

# Start backend
pushd ./berryhunterd/
screen -dmSL berryhunterd ./berryhunterd
