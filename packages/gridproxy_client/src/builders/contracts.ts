import { assertBoolean, assertId, assertIn, assertNatural, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";

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

export interface ContractsQuery {
  page: number;
  size: number;
  retCount: boolean;
  contractId: number;
  twinId: number;
  nodeId: number;
  name: string;
  type: ContractType;
  state: ContractState;
  deploymentData: string;
  deploymentHash: string;
  numberOfPublicIps: number;
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
    assertString(value);
    assertIn(value, [ContractState.Created, ContractState.GracePeriod, ContractState.Deleted]);
  },
  deploymentData: assertString,
  deploymentHash: assertString,
  numberOfPublicIps: assertNatural,
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
