FROM node:22-alpine

ARG GRID_VERSION
RUN apk add --no-cache curl && yarn add @threefold/grid_client@${GRID_VERSION}

ENTRYPOINT [ "yarn" ]
