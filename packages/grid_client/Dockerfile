FROM alpine

ARG GRID3_CLIENT_VERSION
RUN apk add nodejs npm curl && npm install --global yarn && yarn add @threefold/grid_client@${GRID3_CLIENT_VERSION}

ENTRYPOINT [ "yarn" ]
