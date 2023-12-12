import type { FarmInfo, NodeInfo } from "@threefold/grid_client";

export type Locations = {
  [region: string]: string[];
};

export type SelectedLocation = { country?: string; region?: string };

export interface NodeSelectorFilters {
  ipv4?: boolean;
  ipv6?: boolean;
  hasGPU?: boolean;
  cpu?: number;
  memory?: number;
  ssdDisks?: number[];
  hddDisks?: number[];
  rootFilesystemSize?: number;
  solutionDisk?: number;
  certified?: boolean;
  dedicated?: boolean;
  exclusiveFor?: string;
  gateway?: boolean;
}

export interface NormalizeFarmFiltersOptions {
  size: number;
  page: number;
  twinId: number;
  location: SelectedLocation;
}

export interface NormalizeNodeFiltersOptions {
  size: number;
  page: number;
  twinId: number;
  location: SelectedLocation;
  farm: Partial<FarmInfo>;
  gateway?: boolean;
}

export interface DomainInfo {
  selectedDomain: NodeInfo | null;
  enabledCustomDomain: boolean;
  customDomain: string;
}
