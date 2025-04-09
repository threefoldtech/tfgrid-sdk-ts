export const flists = {
  // FullVMs
  fullVMs_ubuntu_24: {
    name: "Ubuntu-24.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-24.04-full.flist",
    entryPoint: "",
  },
  fullVMs_ubuntu_22: {
    name: "Ubuntu-22.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist",
    entryPoint: "/init.sh",
  },
  fullVMs_ubuntu_20: {
    name: "Ubuntu-20.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-20.04-lts.flist",
    entryPoint: "/init.sh",
  },
  fullVMs_ubuntu_18: {
    name: "Ubuntu-18.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-18.04-lts.flist",
    entryPoint: "/init.sh",
  },
  fullVMs_nixos_22: {
    name: "Nixos-22.11",
    flist: "https://hub.grid.tf/tf-official-vms/nixos-22.11.flist",
    entryPoint: "/init.sh",
  },

  // MicroVMs
  microVMs_ubuntu_24: {
    name: "Ubuntu-24.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-24.04-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  microVMs_ubuntu_23: {
    name: "Ubuntu-23.10",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-23.10-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  microVMs_ubuntu_22: {
    name: "Ubuntu-22.04",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist",
    entryPoint: "/sbin/zinit init",
  },
  microVMs_arch: {
    name: "Arch",
    flist: "https://hub.grid.tf/tf-official-vms/arch-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  microVMs_debian_12: {
    name: "Debian-12",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-debian-12.flist",
    entryPoint: "/sbin/zinit init",
  },
  microVMs_alpine_3: {
    name: "Alpine-3",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-alpine-3.flist",
    entryPoint: "/entrypoint.sh",
  },
  microVMs_centos_8: {
    name: "CentOS-8",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-centos-8.flist",
    entryPoint: "/entrypoint.sh",
  },
  microVMs_nixos: {
    name: "Nixos",
    flist: "https://hub.grid.tf/tf-official-vms/nixos-micro-latest.flist",
    entryPoint: "/entrypoint.sh",
  },

  freeflow: {
    value: "https://hub.grid.tf/lennertapp2.3bot/threefoldjimber-freeflow-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  jenkins: {
    value: "https://hub.grid.tf/tf-official-apps/jenkins-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  algorand: {
    value: "https://hub.grid.tf/tf-official-apps/algorand-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  caprover: {
    value: "https://hub.grid.tf/tf-official-apps/tf-caprover-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  casperlabs: {
    value: "https://hub.grid.tf/tf-official-apps/casperlabs-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  discourse: {
    value: "https://hub.grid.tf/tf-official-apps/forum-docker-v3.1.2.flist",
    entryPoint: "/sbin/zinit init",
  },
  funkwhale: {
    value: "https://hub.grid.tf/tf-official-apps/funkwhale-1.4.0.flist",
    entryPoint: "/init.sh",
  },
  gitea: {
    value: "https://hub.grid.tf/tf-official-apps/gitea-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  jitsi: {
    value: "https://hub.grid.tf/tf-official-apps/jitsi-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  mattermost: {
    value: "https://hub.grid.tf/tf-official-apps/mattermost-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  nextcloud: {
    value: "https://hub.grid.tf/tf-official-apps/threefoldtech-nextcloudaio-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  nodePilot: {
    value: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist",
    entryPoint: "/",
  },
  nostr: {
    value: "https://hub.grid.tf/tf-official-apps/nostr_relay-mycelium.flist",
    entryPoint: "/sbin/zinit init",
  },
  owncloud: {
    value: "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist",
    entryPoint: "/sbin/zinit init",
  },
  peertube: {
    value: "https://hub.grid.tf/tf-official-apps/peertube-v3.1.1.flist",
    entryPoint: "/sbin/zinit init",
  },
  presearch: {
    value: "https://hub.grid.tf/tf-official-apps/presearch-v2.3.flist",
    entryPoint: "/sbin/zinit init",
  },
  staticwebsite: {
    value: "https://hub.grid.tf/tf-official-apps/staticwebsite-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  subsquid: {
    value: "https://hub.grid.tf/tf-official-apps/subsquid-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  taiga: {
    value: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  umbrel: {
    value: "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  wordpress: {
    value: "https://hub.grid.tf/tf-official-apps/tf-wordpress-latest.flist",
    entryPoint: "/sbin/zinit init",
  },
  tfrobot: {
    value: "https://hub.grid.tf/tf-official-apps/tfrobot.flist",
    entryPoint: "/sbin/zinit init",
  },
};
