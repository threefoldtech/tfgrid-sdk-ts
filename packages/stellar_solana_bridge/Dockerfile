FROM node:18 AS build

WORKDIR /app

COPY . .
# Install yarn and build project
RUN yarn install
RUN yarn lerna run build --no-private && yarn workspace @threefold/stellar_solana_bridge build

# install nginx
FROM nginx:1.27-alpine

# serve the build files using nginx
COPY --from=build /app/packages/stellar_solana_bridge/dist /usr/share/nginx/html
COPY --from=build /app/packages/stellar_solana_bridge/scripts/build-env.sh /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
RUN apk add --no-cache bash
RUN chmod +x build-env.sh

EXPOSE 80
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/build-env.sh && nginx -g \"daemon off;\""]
