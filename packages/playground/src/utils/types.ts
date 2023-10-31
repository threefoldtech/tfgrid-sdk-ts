export enum IPType {
  single = "Single",
  range = "Range",
}

export interface IPublicConfig {
  ip4: string;
  gw4: string;
  ip6?: string;
  gw6?: string;
  domain?: string;
}
