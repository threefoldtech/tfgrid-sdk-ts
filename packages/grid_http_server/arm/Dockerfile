FROM alpine AS build

ARG GRID_VERSION
RUN apk add nodejs npm curl python3 build-base && npm install --global yarn && yarn add @threefold/grid_http_server@${GRID_VERSION}

FROM alpine
RUN apk add nodejs npm curl && npm install --global yarn
COPY --from=build /node_modules /node_modules
COPY --from=build /package.json /yarn.lock /

ENTRYPOINT [ "yarn" ]
