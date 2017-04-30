#!/bin/bash
# This script updates the backend and restarts it

# Shutdown old backend
screen -S backend -X quit

# Panic on error
set -e

# Get changes
git pull

# Rebuild backend binary
pushd ./backend/

go build

# Start backend
screen -S backend backend
