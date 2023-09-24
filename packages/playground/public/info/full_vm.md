---
title: Full Virtual Machine
---

Deploy a full virtual machine on Threefold Grid, the full VM allows you to have a complete image with a custom kernel optimized for your own usecase.

We provide a few images managed by Threefold like Ubuntu 22.04, and NixOS, but you can still use a custom one. For more details, check [Full Virtual Machine documentation](https://manual.grid.tf/playground/fullVm.html).

<br />

#### Compared to MicroVMs

- Full VM contains a default disk attached to it which is not the case in the Micro VM where you needed to make sure to attach a disk to it or the VM will fail
- The default disk is mounted on / so if you want to attach any additional disks, you have to choose a different mounting point
- Only cloud init flists can be deployed on Full VM. You can check official Threefold flists here
- In Full VM, you need to mount the additional disks manually after the VM is deployed
