# 1. update_deployment_store_path

Date: 2023-10-22

## Status

Done

## Context

Previously we didn't have a way to tell that a gateway is related to a certain virtual machine. So we decided to make some updates will be listed below in order to be able to group all deployments' workloads in a similar path hierarchy.

e.g

```bash
tfchain
  |_ tfkvstore
    |_ machines
    | |_ vm # projectName
    |    |_ testvm # instanceName
    |      |_ testvm
    |          |_ contracts.json
    |_ gateways
       |_ vm # projectName
         |_ testvm # instanceName
           |_ testvmGateway
              |_ contracts.json
```

## Decision

1. For old deployments

   - We added a migration script will be applied whenever the user tries to list his own deployments
   - Migrated deployments will be getting an update in their contracts' data (if needed)
   - Migrating the contracts is done by only one request to update the contract.
   - Keys stored on the kvstore on tfchain are migrated by creating a new key and removing the old one.

2. For new deployments
   - The projectName has been updated to match the new pattern for the deployment. For example, if the deployment is called `testvm` in the projectName called `vm` the new projectName will be `vm/testvm` instead of `vm`.
   - Gateways will be stored in the same previous projectName pattern mentioned above.
   - Listing will follow the same pattern. After listing all deployments related to a specific projectName (e.g `p1`) let's say we got deployments `[d1, d2]` so we will load the deployment of `d1` from the projectName `p1/d1` and the deployment `d2` is the same in the playground.
   - For Kubernetes, it doesn't use any projectName so the projectName will be the instanceName itself.

## Consequences

There is no specific consequences related.
