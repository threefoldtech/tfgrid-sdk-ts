export interface IStore {
  type:
    | "Kubernetes"
    | "Machines"
    | "VM"
    | "CapRover"
    | "Discourse"
    | "funkwhale"
    | "Funkwhale"
    | "GatewayName"
    | "Add Worker"
    | "Remove Worker"
    | "Deleting Deployment"
    | "Taiga"
    | "Owncloud"
    | "Presearch"
    | "Subsquid"
    | "Mattermost"
    | "Mastodon"
    | "TFhubValidator"
    | "Casperlabs"
    | "NodePilot"
    | "Fullvm"
    | "Algorand"
    | "Qvm"
    | "QSFS"
    | "Umbrel"
    | "Wordpress";
  name: string;
  message: string;
}
