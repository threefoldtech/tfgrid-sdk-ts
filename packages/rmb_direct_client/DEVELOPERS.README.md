# Types Update Guide for Developers

## Introduction

This guide outlines the steps to update the types used in the `RMB Direct Client` to reflect changes in messages sent over the RMB.

### Prerequisites

1. **Install Protobuf v21.2**: Install Protobuf version [v21.2](https://github.com/protocolbuffers/protobuf/releases/tag/v21.2) on your system.

2. **Install CMake**: Install [CMake](https://github.com/naftalimurgor/CMake.sh) on your system.

> **Note:** Refer to [gRPC Protoc Installation](https://grpc.io/docs/protoc-installation/) for additional help.

## Usage

After updating the types, ensure that the client is updated accordingly to utilize the auto-generated [types.ts](lib/types/lib/types.ts) file.

1. **Update types.proto File**: Update the [types.proto](lib/types.proto) file with any changes to the message structure.

2. **Build Protobuf**: Follow the instructions in the [protobuf README](https://github.com/protocolbuffers/protobuf/blob/main/cmake/README.md#c-version) to build the protobuf library.

3. **Run build.sh Script**: Execute the [build.sh](build.sh) script to generate the necessary TypeScript files.
