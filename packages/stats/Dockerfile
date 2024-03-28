FROM node:18 AS build

WORKDIR /app

COPY . /app/

# Install yarn and build project
RUN yarn install
RUN yarn lerna run build --no-private && yarn workspace @threefold/stats build

FROM nginx:1.25.3-alpine
COPY --from=build /app/packages/stats/dist /usr/share/nginx/html
COPY --from=build /app/packages/stats/nginx /etc/nginx
RUN mkdir -p /etc/zinit;
COPY --from=build /app/packages/stats/zinit /etc/zinit

RUN curl --location  https://github.com/threefoldtech/zinit/releases/download/v0.2.10/zinit -o /sbin/zinit && \
    chmod +x /sbin/zinit
RUN echo "* */6 * * * curl localhost/api/stats-update" >> /var/spool/cron/crontabs/root

ENTRYPOINT [ "/sbin/zinit", "init" ]