# 1. deployments_with_publicIPs

Date: 2022-09-28

## Status

Accepted

## Context

Currently, the contracts module only supports updating the contract's hash, but can't update the public IP field, and the deployment may have some workloads that need to be added (another VM with public IP) or some workloads that need to be removed (a VM with public IP) and keep the rest workloads.

## Decision

- For a deployment with a workload of a public IP, It will be deployed separately in a new contract.
- If the first deployment has a workload of a public IP and a network workload, The network workload will be deployed in a separate contract.
- When we update a deployment with a workload of a public IP with a new deployment without public IP, a new contract is created for the new deployment.
- Workloads of no Public IPs will be merged in the same deployment.
- A workload with a public IP can't be added to an existent deployment.

## Consequences

- Public IP workload has a separate contract.
- Delete contracts with public IPs, it will not affect the other deployments (with/without public IPs).
