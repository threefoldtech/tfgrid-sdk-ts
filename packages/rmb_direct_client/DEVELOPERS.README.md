# Types Update Guide for Developers

## Introduction

This guide outlines the steps to update the types used in the `RMB Direct Client` to reflect changes in messages sent over the RMB.

### Prerequisites

- **Install Protobuf**: Install [Protobuf](https://grpc.io/docs/protoc-installation/) on your system.

> **Note:** Refer to [gRPC Protoc Installation](https://grpc.io/docs/protoc-installation/) for additional help.

## Usage

After updating the types, ensure that the client is updated accordingly to utilize the auto-generated [types.ts](lib/types/lib/types.ts) file.

1. **Update types.proto File**: Update the [types.proto](lib/types.proto) file with any changes to the message structure.
2. **Run build.sh Script**: Execute the [build.sh](build.sh) script to generate the necessary TypeScript files.
