# 2. update_deployment_store_path

Date: 2023-10-22

## Status

Done

## Context

Previously we didn't have a way to tell that this gateway related to that deployment. So we decided to make some updates will be listed below in order to being able to group all deployment related stuff in a single path treating path as a folder.

e.g

```bash
tfchain
  |_ tfkvstore
    |_ machines
      |_ vm # projectName
         |_ testvm # instanceName
           |_ testvm
           |   |_ contracts.json
           |_ testvmGateway
              |_ contracts.json
```

## Decision

1. For old deployments

   - We added a migration script will be ablied whenever the user tries to list his own deployments
   - Migratable deployments will be getting an update in it's contracts data (if needed)
   - Migration will applied once for each contract (Write new contract data then remove the old one)

2. For new deployments
   - Updated projectName to match the new pattern for a deployment called `testvm` in projectName called `vm` the new projectName will be `vm/testvm` instead of `vm`.
   - Gateways will be stored in the same previous projectName pattern mentioned above.
   - Listing will follow the same pattern. After listing all deployments related to a specific projectName (e.g `p1`) let's say we get deployment as follow `[d1, d2]` so we will load deployment of `p1/d1` & `p1/d2` in playground.
   - For kubernetes it doesn't use any projectName so the projectName will be the instanceName itself.

## Consequences

There is no specific consquences related to this issue but an issue appeared <a target="_blank" href="https://github.com/threefoldtech/tfchain_graphql/issues/135">tfchain_graphql#135</a>.
