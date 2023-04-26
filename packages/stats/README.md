# Grid Stats

![Version](https://img.shields.io/github/package-json/v/threefoldtech/tfgrid-sdk-ts?color=blue&filename=packages%2Fstats%2Fpackage.json)
[![Docker](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/stats_docker.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/stats_docker.yaml)

## Introduction

Grid Stats is a web application created to replace explorer.threefold.io with a simple page showing a capacity map + statistics. In the map, you get to see node distribution with each node location highlighted. While in Statistics section, general details about the nodes are being displayed like online nodes, farms count, total storage used, gateways ...etc.

## Installation

- **Prerequisite**

  - Nodejs 16^

- **Clone the repository**

  ```bash
  git clone https://github.com/threefoldtech/tfgrid-sdk-ts.git
  ```

## Get started

Install the dependencies...

Before running the Grid Stats, in your terminal move to the project directory, then install the required dependencies using

```bash
cd tfgrid-sdk-ts
yarn install
```

You can now run the project in development mode using

```bash
yarn workspace @threefold/stats dev
```

## Building and running in production mode

To create an optimised version of the app:

```bash
yarn workspace @threefold/stats build
```

This will generate the production build in the [public](./public/) directory, which can be served using [Caddy](https://caddyserver.com/) or [NGINX](https://www.nginx.com/)
