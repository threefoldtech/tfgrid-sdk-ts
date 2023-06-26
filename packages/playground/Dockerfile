# choose the Image which has Node installed already
FROM node:18 AS build

# add arg for the network
ARG NETWORK

# add arg for the version
ARG VERSION

# make the 'app' folder the current working directory
WORKDIR /app

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# install project dependencies
RUN yarn install


# build project solutions
RUN yarn lerna run build --no-private && yarn workspace @threefold/playground build

# install nginx
FROM nginx:1.19-alpine

# serve the build files using nginx
COPY --from=build /app/packages/playground/dist /usr/share/nginx/html
COPY --from=build /app/packages/playground/scripts/build-env.sh /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
RUN apk add --no-cache bash
RUN chmod +x build-env.sh

EXPOSE 80
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/build-env.sh && nginx -g \"daemon off;\""]
