# 2. update_deployment_store_path

Date: 2023-10-22

## Status

Done

## Context

Previously we had no way to group folders so we decided to allow combining related contracts as a folder structure can be used in different project (e.g playground).

## Decision

- We are migrating old key to a new one which allows us to combine related contracts together as a folder grouping.
- Pattern: `[network]/[twinId]/[projectName]/[moduleName]/[instanceName]/contracts.json` to `[network]/[twinId]/[moduleName]/[projectName]/[instanceName]/contracts.json`
- Example: `dev/370/vm/machines/testvm/contracts.json` to `dev/370/machines/vm/testvm/contracts.json`

## Consequences

There is no specific consequences related.
