# stage 1
FROM node:14.17.0-alpine as build

WORKDIR /app

# Copy vue app source code
COPY . /app/

# Install yarn and build project
RUN yarn cache clean
RUN yarn install
RUN npm run build

# stage 2
FROM nginx:1.16.0-alpine

# Copy dist from stage(1) 
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/scripts/build-env.sh /usr/share/nginx/html

# Add custom nginx conf
RUN rm /etc/nginx/conf.d/default.conf
COPY /nginx.conf /etc/nginx/conf.d

WORKDIR /usr/share/nginx/html
RUN apk add --no-cache bash
RUN chmod +x build-env.sh

# Serve the app
EXPOSE 80
CMD [ "/bin/bash", "-c", "/usr/share/nginx/html/build-env.sh && nginx -g \"daemon off;\"" ]
