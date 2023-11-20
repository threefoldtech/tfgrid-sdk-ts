export enum IPType {
  single = "Single",
  range = "Range",
}

export interface IPublicConfig {
  ipv4: string;
  gw4: string;
  ipv6?: string;
  gw6?: string;
  domain?: string;
}
