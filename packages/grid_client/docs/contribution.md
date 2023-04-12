# Contribution

## How to Add a New Module

Module should be:

- In [modules directory](../src/modules).
- A class and its methods should have [expose decorater](../src/helpers/expose.ts)
- Exported in [index file](../src/modules/index.ts)
- Added to GridClient class in [client.ts file](../src/client.ts)

For more details about modules, check [Module Docs](./module.md)

**Note:** Some of Grid client modules depend on the [Chain](https://github.com/threefoldtech/tfchain_client_js). Make sure the module is added to the chain first then use the released version of the Chain before adding the module to the Client.
