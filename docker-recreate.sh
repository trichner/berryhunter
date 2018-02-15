#!/bin/bash

set -x
set -e

docker build -t berryhunter .
docker run -it --rm -p=127.0.0.1:2000:2000 berryhunter
