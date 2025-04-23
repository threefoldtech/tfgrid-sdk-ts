/**
 * Example file demonstrating how to use the flist-registry
 */

import { APP_FLISTS, getFlist, VM_IMAGES } from "../constants/flist-registry";

// Example 1: Using a VM image directly
const ubuntuVM = VM_IMAGES.UBUNTU_24_04_MICRO;
console.log(`Using Ubuntu VM flist: ${ubuntuVM.value} with entryPoint: ${ubuntuVM.entryPoint}`);

// Example 2: Using an application flist directly
const wordpressApp = APP_FLISTS.WORDPRESS;
console.log(`Using WordPress flist: ${wordpressApp.value} with entryPoint: ${wordpressApp.entryPoint}`);

// Example 3: Using the getFlist helper function
const nextcloudFlist = getFlist("NEXTCLOUD" as keyof typeof APP_FLISTS);
if (nextcloudFlist) {
  console.log(`Found NextCloud flist: ${nextcloudFlist.value} with entryPoint: ${nextcloudFlist.entryPoint}`);
}

// Example 4: Using in a deployment configuration
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
