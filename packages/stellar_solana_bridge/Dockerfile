FROM node:22 AS build

WORKDIR /app

COPY . .
# Install yarn and build project
RUN yarn install
RUN yarn lerna run build --no-private && yarn workspace @threefold/stellar_solana_bridge build

# install nginx
FROM nginx:1.27-alpine

# serve the build files using nginx
COPY --from=build /app/packages/stellar_solana_bridge/dist /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
RUN apk add --no-cache bash

EXPOSE 80
CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]
