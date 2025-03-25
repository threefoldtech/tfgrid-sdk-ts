FROM node:18 AS build

WORKDIR /app

COPY . .
# Install yarn and build project
RUN yarn install
RUN yarn lerna run build --no-private && yarn workspace @threefold/tft_solana build
