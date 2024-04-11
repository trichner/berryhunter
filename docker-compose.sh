#!/bin/bash

exec docker-compose -f compose/docker-compose.local.yml -p berryhunter "$@"
