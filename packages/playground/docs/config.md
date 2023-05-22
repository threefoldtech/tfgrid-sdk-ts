# Install nodejs ^16.0.0

Dowload the latest binary from the [official nodejs site](https://nodejs.org/en/download/).

## Verify your installation

```bash
node -v
npm -v
```

## Make sure to install the latest stable Node version to avoid errors while installing node_modules

```bash
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

## Install yarn

```bash
npm install --global yarn
yarn --version
```
