#!/bin/sh
caddy reverse-proxy --to $IP:$PORT --from :$TARGET_PORT
