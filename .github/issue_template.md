---
title: Grid Nightly failed during schedule on ${{ env.NETWORK }}
body: |
  ## Failure Report

  **Details on failed run**: [View Run Details](https://github.com/tfgrid-sdk-ts/actions/runs/{{ env.RUN_ID }})

  - **Dynamic Single Vm**: ({{ env.SINGLE_VM }})
  - **Multiple Vm**: ({{ env.MULTIPLE_VM }})
  - **Kubernetes**: ({{ env.K8S }})
  - **Vmq QSFS**: ({{ env.VM_QSFS }})
  - **Kubernetes QSFS**: ({{ env.K8S_QSFS }})
  - **Kvstore**: ({{ env.KV_STORE }})
  - **Zdb**: ({{ env.ZDB }})
  - **Delete all contracts**: ({{ env.DELETE_ALL }})
labels: type_bug, grid_client
---
