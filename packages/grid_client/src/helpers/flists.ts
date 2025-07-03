export const FLISTS = {
  // FullVMs
  FULLVMS_UBUNTU_24: {
    name: "Ubuntu-24.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-24.04-full.flist",
    entryPoint: "",
  },
  FULLVMS_UBUNTU_22: {
    name: "Ubuntu-22.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist",
    entryPoint: "",
  },
  FULLVMS_UBUNTU_20: {
    name: "Ubuntu-20.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-20.04-lts.flist",
    entryPoint: "",
  },
  FULLVMS_UBUNTU_18: {
    name: "Ubuntu-18.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-18.04-lts.flist",
    entryPoint: "",
  },
  // FULLVMS_NIXOS_22: {
  //   name: "Nixos-22.11",
  //   flist: "https://hub.grid.tf/tf-official-vms/nixos-22.11.flist",
  //   entryPoint: "",
  // },

  // MicroVMs
  MICROVMS_UBUNTU_24: {
    name: "Ubuntu-24.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-24.04-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  MICROVMS_UBUNTU_23: {
    name: "Ubuntu-23.10",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-23.10-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  MICROVMS_UBUNTU_22: {
    name: "Ubuntu-22.04",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist",
    entryPoint: "/sbin/zinit init",
  },
  MICROVMS_ARCH: {
    name: "Arch",
    flist: "https://hub.grid.tf/petep.3bot/archlinux_20240101.0.204074.flist",
    entryPoint: "/sbin/zinit init",
  },
  MICROVMS_DEBIAN_12: {
    name: "Debian-12",
    flist: "https://hub.grid.tf/tf-official-apps/debian12.flist",
    entryPoint: "/sbin/zinit init",
  },
  MICROVMS_ALPINE_3: {
    name: "Alpine-3",
    flist: "https://hub.grid.tf/tf-official-apps/alpine3.flist",
    entryPoint: "/entrypoint.sh",
  },
  MICROVMS_CENTOS_9: {
    name: "CentOS-9",
    flist: "https://hub.grid.tf/tf-official-apps/centos-stream9.flist",
    entryPoint: "/entrypoint.sh",
  },
  // MICROVMS_NIXOS: {
  //   name: "Nixos",
  //   flist: "https://hub.grid.tf/tf-official-vms/nixos-22.11.flist",
  //   entryPoint: "/entrypoint.sh",
  // },

  FREEFLOW: {
    value: "https://hub.grid.tf/lennertapp2.3bot/threefoldjimber-freeflow-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  JENKINS: {
    value: "https://hub.grid.tf/tf-official-apps/jenkins-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  ALGORAND: {
    value: "https://hub.grid.tf/tf-official-apps/algorand-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  CAPROVER: {
    value: "https://hub.grid.tf/tf-official-apps/tf-caprover-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  CASPERLABS: {
    value: "https://hub.grid.tf/tf-official-apps/casperlabs-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  DISCOURSE: {
    value: "https://hub.grid.tf/tf-official-apps/forum.flist",
    entryPoint: "/sbin/zinit init",
  },
  FUNKWHALE: {
    value: "https://hub.grid.tf/tf-official-apps/funkwhale-1.4.0.flist",
    entryPoint: "/sbin/zinit init",
  },
  GITEA: {
    value: "https://hub.grid.tf/tf-official-apps/gitea-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  JITSI: {
    value: "https://hub.grid.tf/tf-official-apps/jitsi-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  MATTERMOST: {
    value: "https://hub.grid.tf/tf-official-apps/mattermost-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  NEXTCLOUD: {
    value: "https://hub.grid.tf/tf-official-apps/nextcloud.flist",
    entryPoint: "/sbin/zinit init",
  },
  NODEPILOT: {
    value: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist",
    entryPoint: "/",
  },
  NOSTR: {
    value: "https://hub.grid.tf/tf-official-apps/nostr_relay-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  OWNCLOUD: {
    value: "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist",
    entryPoint: "/sbin/zinit init",
  },
  PEERTUBE: {
    value: "https://hub.grid.tf/tf-official-apps/peertube-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  PRESEARCH: {
    value: "https://hub.grid.tf/tf-official-apps/presearch.flist",
    entryPoint: "/sbin/zinit init",
  },
  STATICWEBSITE: {
    value: "https://hub.grid.tf/tf-official-apps/staticwebsite-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  SUBSQUID: {
    value: "https://hub.grid.tf/tf-official-apps/subsquid.flist",
    entryPoint: "/sbin/zinit init",
  },
  TAIGA: {
    value: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  UMBREL: {
    value: "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  WORDPRESS: {
    value: "https://hub.grid.tf/tf-official-apps/tf-wordpress-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  TFROBOT: {
    value: "https://hub.grid.tf/tf-official-apps/tfrobot.flist",
    entryPoint: "/sbin/zinit init",
  },
};
