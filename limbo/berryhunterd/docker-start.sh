#!/bin/sh

set -e

dd if=/dev/urandom bs=1 count=18 2>/dev/null | base64 > tokens.list
echo "generated tokens:"
cat tokens.list

exec ./berryhunterd