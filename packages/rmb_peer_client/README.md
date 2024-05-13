# RMB Peer Client

[![Version](https://img.shields.io/npm/v/@threefold/rmb_peer_client?color=blue)](https://www.npmjs.com/package/@threefold/rmb_peer_client)
[![Lint](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml)

The RMB Peer Client is a TypeScript library that enables communication with the ThreeFold Messaging Bus (RMB). It provides functionalities similar to the [Rust client](https://github.com/threefoldtech/rmb-rs).

## Usage

To use the RMB Peer Client, instantiate the `MessageBusClient` class:

```ts
import { MessageBusClient } from "@threefold/rmb_peer_client";

const messageBus = new MessageBusClient();
```

You can send messages over the RMB using the `send` method, which takes the following parameters:

1. `requestCommand` The command to be executed in the Zero-OS node.
2. `requestData` The message content.
3. `destinationTwinId` The ID of the destination twin to receive the message.
4. `expirationMinutes` Expiration time for the message in minutes.

```ts
const requestId = await messageBus.send("zos.nodes.list", "", 143, 5);
```

After sending a message, you can read the response using the `read` method:

```ts
const response = await messageBus.read(requestId);
```

## Installation

Install the package via npm:

```bash
npm install @threefold/rmb_peer_client
```

## Example

```ts
import { MessageBusClient } from "@threefold/rmb_peer_client";

const messageBus = new MessageBusClient();

// Send a message
const requestId = await messageBus.send("zos.nodes.list", "", 143, 5);

// Read the response
const response = await messageBus.read(requestId);
```

## API

### `MessageBusClient()`

- Constructor function to create a new instance of the RMB Peer Client.
- Accepts an optional `port` parameter to specify the Redis server port. Defaults to `6379`.

### `send(requestCommand: string, requestData: string, destinationTwinId: number, expirationMinutes: number): Promise<string>`

- Method to send a message over the RMB.
- Returns a promise that resolves to the request ID.

### `read(requestId: string, timeoutMinutes = 1): Promise<unknown>`

- Method to read the response for a specific request ID.
- Accepts an optional `timeoutMinutes` parameter to specify the timeout duration for waiting for the response.
- Returns a promise that resolves to the response data.

## Requirements

- Redis server running locally or on a specified host/port.
