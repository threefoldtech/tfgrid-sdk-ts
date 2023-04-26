FROM alpine

ARG GRID_VERSION
RUN apk add nodejs npm curl && npm install --global yarn && yarn add @threefold/grid_client@${GRID_VERSION}

ENTRYPOINT [ "yarn" ]
