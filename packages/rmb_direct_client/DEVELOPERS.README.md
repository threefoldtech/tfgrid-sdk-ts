# Types update `Developers`

## Introduction

To reflect changes in messages sent over the RMB in the client, the following steps are needed

1. Update [types.proto](lib/types.proto)
2. Install the protobuf [v21.2](https://github.com/protocolbuffers/protobuf/releases/tag/v21.2)
3. Install [cmake](https://github.com/naftalimurgor/CMake.sh)
4. Build the [protobuf](https://github.com/protocolbuffers/protobuf/blob/main/cmake/README.md#c-version)
5. Run [build.sh](build.sh)

PS: This like also can help you https://grpc.io/docs/protoc-installation/

## Usage

Update the client accordingly to the auto-generated [types.ts](lib/types/lib/types.ts)
