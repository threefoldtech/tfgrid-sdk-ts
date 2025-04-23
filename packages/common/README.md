# @threefold/common

This package contains common utilities and constants used across the Threefold Grid SDK.

## Installation

```bash
npm install @threefold/common
# or
yarn add @threefold/common
```

## Usage

### Flist Registry

The flist registry provides a centralized collection of all flist URLs and their entrypoints used in the Threefold Grid SDK.

```typescript
import { VM_IMAGES, APP_FLISTS, getFlist } from "@threefold/common";

// Using a VM image directly
const ubuntuVM = VM_IMAGES.UBUNTU_24_04_MICRO;
console.log(`Using Ubuntu VM flist: ${ubuntuVM.value} with entryPoint: ${ubuntuVM.entryPoint}`);

// Using an application flist directly
const wordpressApp = APP_FLISTS.WORDPRESS;
console.log(`Using WordPress flist: ${wordpressApp.value} with entryPoint: ${wordpressApp.entryPoint}`);

// Using the getFlist helper function
const nextcloudFlist = getFlist("NEXTCLOUD" as keyof typeof APP_FLISTS);
if (nextcloudFlist) {
  console.log(`Found NextCloud flist: ${nextcloudFlist.value} with entryPoint: ${nextcloudFlist.entryPoint}`);
}
```

### Using in Deployment Configurations

```typescript
import { VM_IMAGES, APP_FLISTS, getFlist } from "@threefold/common";

// Example: Creating a deployment configuration
function createDeploymentConfig(name: string, flistKey: keyof typeof APP_FLISTS | keyof typeof VM_IMAGES) {
  const flist = getFlist(flistKey);
  if (!flist) {
    throw new Error(`Flist with key ${flistKey} not found`);
  }

  return {
    name,
    flist: flist.value,
    entryPoint: flist.entryPoint,
    // Other configuration properties...
  };
}

const wordpressDeployment = createDeploymentConfig("my-wordpress", "WORDPRESS");
console.log("WordPress deployment config:", wordpressDeployment);
```

## Available Flists

### VM Images

- `UBUNTU_24_04_MICRO`
- `UBUNTU_23_10_MICRO`
- `UBUNTU_22_04_MICRO`
- `ARCH_MICRO`
- `DEBIAN_12_MICRO`
- `ALPINE_3_MICRO`
- `CENTOS_8_MICRO`
- `NIXOS_MICRO`
- `UBUNTU_24_04_FULL`
- `UBUNTU_22_04_FULL`
- `UBUNTU_20_04_FULL`
- `UBUNTU_18_04_FULL`
- `NIXOS_22_11_FULL`
- `BASE`

### Application Flists

- `SUBSQUID`
- `UMBREL`
- `PEERTUBE`
- `NEXTCLOUD`
- `STATIC_WEBSITE`
- `JENKINS`
- `OWNCLOUD`
- `NODE_PILOT`
- `JITSI`
- `WORDPRESS`
- `FREEFLOW`
- `MATTERMOST`
- `FUNKWHALE`
- `TAIGA`
- `DISCOURSE`
- `PRESEARCH`
- `GITEA`
- `KUBERNETES`

## Contributing

To add a new flist to the registry, update the `flist-registry.ts` file in the `src/constants` directory.
