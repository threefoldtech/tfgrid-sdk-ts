# Grid Stats

![Version: 1.0.0](https://img.shields.io/github/v/release/threefoldtech/tfgrid_stats)
[![CI-CD](https://github.com/threefoldtech/tfgrid_stats/actions/workflows/docker.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid_stats/actions/workflows/docker.yaml)

## Introduction

Grid Stats is a web application created to replace explorer.threefold.io with a simple page showing a capacity map + statistics. In the map, you get to see node distribution with each node location highlighted. While in Statistics section, general details about the nodes are being displayed like online nodes, farms count, total storage used, gateways ...etc.

## Installation

- **Prerequisite**

  - Nodejs 16^

- **Clone the repository**

  ```bash
  git clone https://github.com/threefoldtech/tfgrid-stats.git
  ```

## Get started

Install the dependencies...

Before running the Grid Stats, in your terminal move to the project directory, then install the required dependencies using

```bash
cd tfgrid_stats
npm install
```

You can now run the project in development mode using

```bash
npm run dev
```

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

This will generate the production build in the `public` directory, which can be served using [Caddy](https://caddyserver.com/) or [NGINX](https://www.nginx.com/)

## Related Documentations

- [Configure the editor/IDE](./docs/editor_config.md)
- [Pipelines documentation](./docs/workflows.md)
- [Releasing process](./docs/release.md)
