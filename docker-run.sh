#!/bin/bash

docker run --rm -it \
-v "`pwd`/frontend/:/root/frontend" \
-v "`pwd`/api/items/:/root/frontend/js/item-definitions" \
-v "`pwd`/api/schema/js/:/root/frontend/js/schema" \
-v "`pwd`/backend/tokens.list:/root/berryhunter/tokens.list" \
-p 127.0.0.1:2000:80 berryhunterd:latest