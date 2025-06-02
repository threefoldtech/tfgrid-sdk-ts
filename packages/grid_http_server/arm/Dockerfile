FROM node:22-alpine AS build

ARG GRID_VERSION
RUN apk add --no-cache curl python3 build-base && yarn add @threefold/grid_http_server@${GRID_VERSION}

FROM node:22-alpine
RUN apk add --no-cache curl
COPY --from=build /node_modules /node_modules
COPY --from=build /package.json /yarn.lock /

ENTRYPOINT [ "yarn" ]
