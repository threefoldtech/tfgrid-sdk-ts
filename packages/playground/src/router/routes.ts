enum DeployRoutes {
  BaseRoute = "/deploy/",
  PricingCalculator = "/deploy/pricing-calculator/",
  NodeFinder = "/deploy/node-finder/",
  VirtualMachines = "/deploy/virtual-machines/",
  Orchestrators = "/deploy/orchestrators/",
  Applications = "/deploy/labs/",
  Domains = "/deploy/domains/",
  YourContracts = "/deploy/your-contracts/",
  Images = "https://hub.grid.tf/",
  SSHKey = "/deploy/sshkey/",
}

enum VirtualMachinesRoutes {
  FullVirtualMachine = "/deploy/virtual-machines/full-virtual-machine/",
  MicroVirtualMachine = "/deploy/virtual-machines/micro-virtual-machine/",
}

enum OrchestratorsRoutes {
  Kubernetes = "/deploy/orchestrators/kubernetes/",
  CapRover = "/deploy/orchestrators/caprover/",
}

enum FarmRoutes {
  BaseRoute = "/farms/",
  YourFarms = "/farms/your-farms/",
  FarmFinder = "/farms/farm-finder/",
  NodeInstaller = "https://bootstrap.grid.tf/",
  Simulator = "/farms/simulator/",
}

enum TFGridRoutes {
  BaseRoute = "/tf-grid/",
  GridStatus = "https://status.grid.tf/status/threefold/",
  NodeStatistics = "/tf-grid/node-statistics/",
  NodeMonitoring = "https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?orgId=2&refresh=30s/",
}

enum TFChainRoutes {
  BaseRoute = "/tf-chain/",
  YourProfile = "/tf-chain/your-profile/",
  TFDAO = "/tf-chain/dao/",
  TFTokenBridge = "/tf-chain/token-bridge/",
  TFTokenTransfer = "/tf-chain/token-transfer/",
  TFMintingReports = "/tf-chain/minting-reports/",
}

enum OtherRoutes {
  Manual = "https://manual.grid.tf/",
  HomePage = "/",
  Settings = "/settings",
}

enum ApplicationRoutes {
  BaseRoute = "/deploy/labs/",
  Kubernetes = "/deploy/labs/kubernetes/",
  CapRover = "/deploy/labs/caprover/",
  Peertube = "/deploy/labs/peertube/",
  StaticWebsite = "/deploy/labs/static_website/",
  Funkwhale = "/deploy/labs/funkwhale/",
  Mattermost = "/deploy/labs/mattermost/",
  Discourse = "/deploy/labs/discourse/",
  Taiga = "/deploy/labs/taiga/",
  Owncloud = "/deploy/labs/owncloud/",
  Nextcloud = "/deploy/labs/nextcloud/",
  Presearch = "/deploy/labs/presearch/",
  Subsquid = "/deploy/labs/subsquid/",
  Casperlabs = "/deploy/labs/casperlabs/",
  Algorand = "/deploy/labs/algorand/",
  Nodepilot = "/deploy/labs/nodepilot/",
  Wordpress = "/deploy/labs/wordpress/",
  Umbrel = "/deploy/labs/umbrel/",
  Freeflow = "/deploy/labs/freeflow/",
  TFRobot = "/deploy/labs/tfrobot/",
  Jenkins = "/deploy/labs/jenkins/",
  Gitea = "/deploy/labs/gitea/",
  Nostr = "/deploy/labs/nostr/",
  Jitsi = "/deploy/labs/jitsi/",
}

const DashboardRoutes = {
  TFGrid: { ...TFGridRoutes },
  TFChain: { ...TFChainRoutes },
  Deploy: { ...DeployRoutes },
  Applications: { ...ApplicationRoutes },
  Farms: { ...FarmRoutes },
  Other: { ...OtherRoutes },
  VirtualMachines: { ...VirtualMachinesRoutes },
};

export {
  DashboardRoutes,
  VirtualMachinesRoutes,
  TFGridRoutes,
  TFChainRoutes,
  OtherRoutes,
  FarmRoutes,
  DeployRoutes,
  ApplicationRoutes,
};
