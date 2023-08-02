---
title: Micro Virtual Machine
---

Deploy a micro virtual machine on Threefold Grid. We provide few images managed by Threefold like Ubuntu 22.04, and NixOS, but you can still use a custom one. For more details, check [Micro Virtual Machine documentation](https://manual.grid.tf/playground/vm.html).

<br />

#### Compared to Full VMs

- Full VM contains a default disk attached to it which is not the case in the Micro VM where you needed to make sure to attach a disk to it or the VM will fail
- The default disk is mounted on / so if you want to attach any additional disks, you have to choose a different mounting point
- Only cloud init flists can be deployed on Full VM. You can check official Threefold flists here
- In Full VM, you need to mount the additional disks manually after the VM is deployed
