import type { VDataTable } from "vuetify/lib/labs/components";

import type { ValidatorStatus } from "@/components/input_validator.vue";

import type * as validators from "../utils/validators";

export interface K8SWorker {
  name: string;
  cpu: number;
  memory: number;
  diskSize: number;
  ipv4: boolean;
  ipv6: boolean;
  planetary: boolean;
  rootFsSize: number;
  farm?: Farm;
}

export interface CaproverWorker {
  name: string;
  farm?: Farm;
  solution?: solutionFlavor;
}

export interface Farm {
  name: string;
  farmID: number;
  country?: string;
}

export interface Flist {
  value: string;
  entryPoint: string;
}

export type VDataTableHeader = VDataTable["headers"];

export enum ProjectName {
  Kubernetes = "Kubernetes",
  Caprover = "CapRover",
  Discourse = "Discourse",
  Funkwhale = "Funkwhale",
  Mastodon = "Mastodon",
  Mattermost = "Mattermost",
  Owncloud = "Owncloud",
  Peertube = "Peertube",
  Subsquid = "Subsquid",
  Taiga = "Taiga",
  Wordpress = "Wordpress",
  Gateway = "GatewayName",
  QVM = "Qvm",
  TFhubValidator = "TFhubValidator",
  Casperlabs = "Casperlabs",
  Presearch = "Presearch",
  VM = "VM",
  NodePilot = "NodePilot",
  Fullvm = "Fullvm",
  Algorand = "Algorand",
  Qvm = "Qvm",
  Umbrel = "Umbrel",
}

export enum SolutionCode {
  peertube = "pt",
  funkwhale = "fw",
  taiga = "tg",
  discourse = "dc",
  owncloud = "oc",
  mattermost = "mm",
  mastodon = "md",
  tfhubvalidator = "tfvalidator",
  casperlabs = "cl",
  presearch = "ps",
  caprover = "cp",
  kubernetes = "k8s",
  machines = "vm",
  vm = "vm",
  nodepilot = "np",
  fullvm = "fvm",
  subsquid = "ss",
  algorand = "al",
  qvm = "qvm",
  umbrel = "um",
  wordpress = "wp",
}

export interface solutionFlavor {
  cpu: number;
  memory: number;
  disk: number;
}

export interface FormValidatorService {
  setStatus(uid: number, value: ValidatorStatus): void;
  unregister(uid: number): void;
}

export interface GatewayNode {
  id: number;
  domain: string;
}

export interface SMTPServer {
  enabled: boolean;
  username: string;
  password: string;
  email: string;
  hostname: string;
  port: number;
  tls: boolean;
  ssl: boolean;
}

export type Validators = typeof validators;
