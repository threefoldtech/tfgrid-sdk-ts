FROM node:18 AS build

WORKDIR /app

COPY . /app/

# Install yarn and build project
RUN yarn install
RUN yarn lerna run build --no-private && yarn workspace @threefold/newstats build

FROM nginx:1.25.3-alpine
COPY --from=build /app/packages/new_stats/dist /usr/share/nginx/html
COPY --from=build /app/packages/new_stats/nginx /etc/nginx
