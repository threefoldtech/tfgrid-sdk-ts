# TS SDK Errors

Errors in this package are divided into 11 [modules](./modules.ts) each module has its own specified errors.

## BaseError class

The `BaseError` class is our starting point, this class extends the `Error` class.
`BaseError` has three main properties `code`, `message`, `module`.

- code: is the index of the error class in it's module `Error` enum.
  - If you have a module and error code you can find the error class easily.
  - for example, the `Generic` module has `Errors` enum and the class of `RequestError` a code 7.
- message: describes what happened and it comes from the class constructor.
- module: it is the error category.

In each module we create a private class that only sets the module value in the extended `ErrorBase` class, then all sub-category error classes extends this class.

### Build

```ts
yarn build
```

### Usage

you can use errors by adding `@threefold/types` to your project

```bash
yarn add @threefold/types
```

Then import the needed error class and throw your new error
for example:

```ts
import { ValidationError, GridClientErrors } from "@threefold/types";
....

throw new ValidationError("error message")
....

throw new GridClientErrors.Farms.InvalidResourcesError("error message")
```

## Error Modules

### Generic

This module contains the generic errors like Validation and TimeOut.

Also, in some cases, we have an error that comes from one of the clients, but we don't know what the error is exactly; in this case, we use a generic error like `RMBError` to mention that this error comes from the RMB client.

#### Generic Errors

1. GridClientError
2. ValidationError
3. TimeoutError
4. ConnectionError
5. RMBError
6. InvalidResponse
7. RequestError

### Grid Client Errors

This section will have all errors that are related to GridClient

#### Farm `tfGridFarm`

For Errors that come from farms or are related to farms resources and farmer bot, we are using this module

0. InvalidResourcesError
1. FarmerBotError
2. NodeSelectionError

#### Node `tfGridNode`

For Errors that come from node or are related to node resources and node network

0. UnavailableNodeError
1. InvalidResourcesError
2. DiskAllocationError
3. AccessNodeError
4. GPUNotFoundError
5. GPULockedError

#### Workloads `tfGridWorkloads`

For Errors that are related to workloads and deployments operations

0. WorkloadDeleteError
1. WorkloadDeployError
2. WorkloadUpdateError
3. WorkloadCreateError

### TFChain Errors

The `TFChainError` class encapsulates error information specific to TFChain operations. This class, along with the `TFChainErrorWrapper`, facilitates detailed and user-friendly error handling and messaging.

#### TFChainError

The `TFChainError` class is designed to capture and throw detailed error information.
This class includes fields for the error `message`, `key`, `section`, `method`, `arguments`, and `documentation`.
The TFChainError class extends the native JavaScript Error class, providing a structured way to handle errors in the TFChain context.

#### TFChainErrorWrapper

The `TFChainErrorWrapper` class processes `DispatchError` and other errors, throwing `TFChainError` with relevant details. This wrapper class ensures that all types of errors encountered during `TFChain` operations are appropriately captured and detailed error messages are thrown

#### How to use it

When you encounter an error during `TFChain` operations, you can use the `TFChainErrorWrapper` to process and throw detailed errors:

```ts
try {
  // Perform some TFChain operation
} catch (error) {
  new TFChainErrorWrapper(error, extrinsic, api).throw();
}
```
