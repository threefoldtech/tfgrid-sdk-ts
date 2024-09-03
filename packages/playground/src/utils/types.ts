export enum IPType {
  single = "Single",
  range = "Range",
}
export enum Selection {
  AUTOMATED = "automated",
  MANUAL = "manual",
}

export interface IPublicConfig {
  ipv4: string;
  gw4: string;
  ipv6?: string;
  gw6?: string;
  domain?: string;
}

export interface ApplicationCard {
  title: string;
  excerpt: string;
  icon: string;
  route: string;
  tags?: string[];
  hasUpdate: boolean;
  releaseDate?: number;
}
