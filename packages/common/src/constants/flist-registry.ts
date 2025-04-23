/**
 * Central registry of all flist URLs and their entrypoints used in the project.
 * This file can be imported anywhere in the project to ensure consistency.
 */

export interface FlistEntry {
  /** The URL of the flist */
  value: string;
  /** The entrypoint for the flist */
  entryPoint: string;
  /** Optional description of the flist */
  description?: string;
}

/**
 * Virtual Machine Images
 */
export const VM_IMAGES = {
  // Micro VMs
  UBUNTU_24_04_MICRO: {
    value: "https://hub.grid.tf/tf-official-vms/ubuntu-24.04-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Ubuntu 24.04 Micro VM",
  },
  UBUNTU_23_10_MICRO: {
    value: "https://hub.grid.tf/tf-official-vms/ubuntu-23.10-mycelium.flist",
    entryPoint: "/sbin/zinit init",
    description: "Ubuntu 23.10 Micro VM",
  },
  UBUNTU_22_04_MICRO: {
    value: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist",
    entryPoint: "/sbin/zinit init",
    description: "Ubuntu 22.04 Micro VM",
  },
  ARCH_MICRO: {
    value: "https://hub.grid.tf/tf-official-vms/arch-mycelium.flist",
    entryPoint: "/sbin/zinit init",
    description: "Arch Linux Micro VM",
  },
  DEBIAN_12_MICRO: {
    value: "https://hub.grid.tf/tf-official-apps/threefoldtech-debian-12.flist",
    entryPoint: "/sbin/zinit init",
    description: "Debian 12 Micro VM",
  },
  ALPINE_3_MICRO: {
    value: "https://hub.grid.tf/tf-official-apps/threefoldtech-alpine-3.flist",
    entryPoint: "/entrypoint.sh",
    description: "Alpine 3 Micro VM",
  },
  CENTOS_8_MICRO: {
    value: "https://hub.grid.tf/tf-official-apps/threefoldtech-centos-8.flist",
    entryPoint: "/entrypoint.sh",
    description: "CentOS 8 Micro VM",
  },
  NIXOS_MICRO: {
    value: "https://hub.grid.tf/tf-official-vms/nixos-micro-latest.flist",
    entryPoint: "/entrypoint.sh",
    description: "NixOS Micro VM",
  },

  // Full VMs
  UBUNTU_24_04_FULL: {
    value: "https://hub.grid.tf/tf-official-vms/ubuntu-24.04-full.flist",
    entryPoint: "",
    description: "Ubuntu 24.04 Full VM",
  },
  UBUNTU_22_04_FULL: {
    value: "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist",
    entryPoint: "/init.sh",
    description: "Ubuntu 22.04 Full VM",
  },
  UBUNTU_20_04_FULL: {
    value: "https://hub.grid.tf/tf-official-vms/ubuntu-20.04-lts.flist",
    entryPoint: "/init.sh",
    description: "Ubuntu 20.04 Full VM",
  },
  UBUNTU_18_04_FULL: {
    value: "https://hub.grid.tf/tf-official-vms/ubuntu-18.04-lts.flist",
    entryPoint: "/init.sh",
    description: "Ubuntu 18.04 Full VM",
  },
  NIXOS_22_11_FULL: {
    value: "https://hub.grid.tf/tf-official-vms/nixos-22.11.flist",
    entryPoint: "/init.sh",
    description: "NixOS 22.11 Full VM",
  },

  // Base images
  BASE: {
    value: "https://hub.grid.tf/tf-official-apps/base:latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Base image",
  },
};

/**
 * Application flists
 */
export const APP_FLISTS = {
  SUBSQUID: {
    value: "https://hub.grid.tf/tf-official-apps/subsquid-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Subsquid application",
  },
  UMBREL: {
    value: "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Umbrel application",
  },
  PEERTUBE: {
    value: "https://hub.grid.tf/tf-official-apps/peertube-v3.1.1.flist",
    entryPoint: "/sbin/zinit init",
    description: "PeerTube application",
  },
  NEXTCLOUD: {
    value: "https://hub.grid.tf/tf-official-apps/threefoldtech-nextcloudaio-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "NextCloud application",
  },
  STATIC_WEBSITE: {
    value: "https://hub.grid.tf/tf-official-apps/staticwebsite-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Static Website application",
  },
  JENKINS: {
    value: "https://hub.grid.tf/tf-official-apps/jenkins-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Jenkins application",
  },
  OWNCLOUD: {
    value: "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist",
    entryPoint: "/sbin/zinit init",
    description: "OwnCloud application",
  },
  NODE_PILOT: {
    value: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist",
    entryPoint: "/",
    description: "Node Pilot application",
  },
  JITSI: {
    value: "https://hub.grid.tf/tf-official-apps/jitsi-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Jitsi application",
  },
  WORDPRESS: {
    value: "https://hub.grid.tf/tf-official-apps/tf-wordpress-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "WordPress application",
  },
  FREEFLOW: {
    value: "https://hub.grid.tf/lennertapp2.3bot/threefoldjimber-freeflow-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Freeflow application",
  },
  MATTERMOST: {
    value: "https://hub.grid.tf/tf-official-apps/mattermost-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Mattermost application",
  },
  FUNKWHALE: {
    value: "https://hub.grid.tf/tf-official-apps/funkwhale-dec21.flist",
    entryPoint: "/init.sh",
    description: "Funkwhale application",
  },
  TAIGA: {
    value: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Taiga application",
  },
  DISCOURSE: {
    value: "https://hub.grid.tf/tf-official-apps/forum-docker-v3.1.2.flist",
    entryPoint: "/sbin/zinit init",
    description: "Discourse application",
  },
  PRESEARCH: {
    value: "https://hub.grid.tf/tf-official-apps/presearch-v2.3.flist",
    entryPoint: "/sbin/zinit init",
    description: "Presearch application",
  },
  GITEA: {
    value: "https://hub.grid.tf/tf-official-apps/gitea-mycelium.flist",
    entryPoint: "/sbin/zinit init",
    description: "Gitea application",
  },
  KUBERNETES: {
    value: "https://hub.grid.tf/tf-official-apps/threefolddev-k3s-v1.31.0.flist",
    entryPoint: "/sbin/zinit init",
    description: "Kubernetes application",
  },
  CASPERLABS: {
    value: "https://hub.grid.tf/tf-official-apps/casperlabs-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Casperlabs application",
  },
  ALGORAND: {
    value: "https://hub.grid.tf/tf-official-apps/algorand-latest.flist",
    entryPoint: "/sbin/zinit init",
    description: "Algorand application",
  },
};

/**
 * Get a flist entry by its key from either VM_IMAGES or APP_FLISTS
 * @param key The key of the flist entry
 * @returns The flist entry or undefined if not found
 */
export function getFlist(key: string): FlistEntry | undefined {
  return VM_IMAGES[key as keyof typeof VM_IMAGES] || APP_FLISTS[key as keyof typeof APP_FLISTS];
}

/**
 * Default export for backward compatibility
 */
export default {
  VM_IMAGES,
  APP_FLISTS,
  getFlist,
};
