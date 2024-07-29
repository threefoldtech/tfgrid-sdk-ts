import { assertBoolean, assertId, assertIn, assertNatural, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";
import { SortOrder } from "./nodes";

export enum ContractType {
  Node = "node",
  Name = "name",
  Rent = "rent",
}

export enum ContractState {
  Created = "Created",
  GracePeriod = "GracePeriod",
  Deleted = "Deleted",
}

export enum SortByContracts {
  CreatedAt = "created_at",
  TwinId = "twin_id",
  ContractId = "contract_id",
  Type = "type",
  State = "state",
}

export interface ContractsQuery {
  page: number;
  size: number;
  retCount: boolean;
  contractId: number;
  twinId: number;
  nodeId: number;
  name: string;
  type: ContractType;
  state: ContractState[];
  deploymentData: string;
  deploymentHash: string;
  numberOfPublicIps: number;
  sortBy: SortByContracts;
  sortOrder: SortOrder;
}

const CONTRACTS_MAPPER: BuilderMapper<ContractsQuery> = {
  page: "page",
  size: "size",
  retCount: "ret_count",
  contractId: "contract_id",
  twinId: "twin_id",
  nodeId: "node_id",
  name: "name",
  type: "type",
  state: "state",
  deploymentData: "deployment_data",
  deploymentHash: "deployment_hash",
  numberOfPublicIps: "number_of_public_ips",
  sortBy: "sort_by",
  sortOrder: "sort_order",
};

const CONTRACTS_VALIDATOR: BuilderValidator<ContractsQuery> = {
  page: assertNatural,
  size: assertNatural,
  retCount: assertBoolean,
  contractId: assertId,
  twinId: assertId,
  nodeId: assertId,
  name: assertString,
  type(value) {
    assertString(value);
    assertIn(value, [ContractType.Name, ContractType.Node, ContractType.Rent]);
  },
  state(value) {
    if (!Array.isArray(value)) {
      throw new Error("Invalid state format. Must be an array of ContractState enums.");
    }
    value.forEach(item => {
      assertString(item);
      assertIn(item, [ContractState.Created, ContractState.GracePeriod, ContractState.Deleted]);
    });
  },
  deploymentData: assertString,
  deploymentHash: assertString,
  numberOfPublicIps: assertNatural,
  sortBy(value) {
    assertString(value);
    assertIn(value, Object.values(SortByContracts));
  },
  sortOrder(value) {
    assertString(value);
    assertIn(value, Object.values(SortOrder));
  },
};

export class ContractsBuilder extends AbstractBuilder<ContractsQuery> {
  constructor(public readonly uri: string, queries: Partial<ContractsQuery> = {}) {
    super({
      mapper: CONTRACTS_MAPPER,
      validator: CONTRACTS_VALIDATOR,
      queries,
    });
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContractsBuilder extends BuilderMethods<ContractsQuery, ContractsBuilder> {}
