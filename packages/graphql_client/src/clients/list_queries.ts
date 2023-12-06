import {
  AbstractWhere,
  Account,
  ArrayWhere,
  BaseWhere,
  BigInt,
  BoolWhere,
  BurnTransaction,
  City,
  ContractBillReport,
  ContractResources,
  ContractState,
  Country,
  DiscountLevel,
  EntityProof,
  EnumWhere,
  Farm,
  FarmCertification,
  FarmingPolicy,
  FitType,
  HistoricalBalance,
  Int,
  Interfaces,
  MintTransaction,
  NameContract,
  Node,
  NodeCertification,
  NodeContract,
  NodeResourcesTotal,
  NruConsumption,
  NullWhere,
  PartialBoolean,
  PricingPolicy,
  PublicConfig,
  PublicIp,
  RefundTransaction,
  RentContract,
  SolutionProvider,
  StringWhere,
  Transfer,
  Twin,
  UptimeEvent,
} from "../types";
import { ByArray } from "./abstract_client";

export const LIST_QUERIES = {
  Node: "nodes",
  Account: "accounts",
  BurnTransaction: "burnTransactions",
  City: "cities",
  ContractBillReport: "contractBillReports",
  ContractResources: "contractResources",
  Country: "countries",
  EntityProof: "entityProofs",
  FarmingPolicy: "farmingPolicies",
  Farm: "farms",
  HistoricalBalance: "historicalBalances",
  Interfaces: "interfaces",
  Location: "locations",
  MintTransaction: "mintTransactions",
  NameContract: "nameContracts",
  NodeContract: "nodeContracts",
  NodeResourcesTotal: "nodeResourcesTotals",
  NruConsumption: "nruConsumptions",
  PricingPolicy: "pricingPolicies",
  PublicConfig: "publicConfigs",
  PublicIp: "publicIps",
  RefundTransaction: "refundTransactions",
  RentContract: "rentContracts",
  SolutionProvider: "solutionProviders",
  Transfer: "transfers",
  Twin: "twins",
  UptimeEvent: "uptimeEvents",
} as const;

// prettier-ignore
interface OrderBy {
    Account: "id" | "wallet" | "balance";
    HistoricalBalance: "id" | "account_id" | "account_wallet" | "account_balance" | "balance" | "timestamp";
    Transfer: "id" | "from" | "to" | "amount" | "timestamp";
    Entity: "id" | "gridVersion" | "entityID" | "name" | "country" | "city" | "accountID";
    Twin: "id" | "gridVersion" | "twinID" | "accountID" | "ip";
    EntityProof: "id" | "entityID" | "signature" | "twinRel_id" | "twinRel_gridVersion" | "twinRel_twinID" | "twinRel_accountID" | "twinRel_ip";
    Farm: "id" | "gridVersion" | "farmID" | "name" | "twinID" | "pricingPolicyID" | "certification" | "stellarAddress" | "dedicatedFarm";
    PublicIp: "id" | "farm_id" | "farm_gridVersion" | "farm_farmID" | "farm_name" | "farm_twinID" | "farm_pricingPolicyID" | "farm_certification" | "farm_stellarAddress" | "farm_dedicatedFarm" | "gateway" | "ip" | "contractId";
    Node: "id" | "gridVersion" | "nodeID" | "farmID" | "twinID" | "location_id" | "location_longitude" | "location_latitude" | "country" | "city" | "publicConfig_id" | "publicConfig_ipv4" | "publicConfig_ipv6" | "publicConfig_gw4" | "publicConfig_gw6" | "publicConfig_domain" | "resourcesTotal_id" | "resourcesTotal_hru" | "resourcesTotal_sru" | "resourcesTotal_cru" | "resourcesTotal_mru" | "uptime" | "created" | "farmingPolicyId" | "certification" | "secure" | "virtualized" | "serialNumber" | "createdAt" | "updatedAt" | "connectionPrice";
    NodeResourcesTotal: "id" | "node_id" | "node_gridVersion" | "node_nodeID" | "node_farmID" | "node_twinID" | "node_country" | "node_city" | "node_uptime" | "node_created" | "node_farmingPolicyId" | "node_certification" | "node_secure" | "node_virtualized" | "node_serialNumber" | "node_createdAt" | "node_updatedAt" | "node_connectionPrice" | "hru" | "sru" | "cru" | "mru";
    Interfaces: "id" | "node_id" | "node_gridVersion" | "node_nodeID" | "node_farmID" | "node_twinID" | "node_country" | "node_city" | "node_uptime" | "node_created" | "node_farmingPolicyId" | "node_certification" | "node_secure" | "node_virtualized" | "node_serialNumber" | "node_createdAt" | "node_updatedAt" | "node_connectionPrice" | "name" | "mac" | "ips";
    PublicConfig: "id" | "node_id" | "node_gridVersion" | "node_nodeID" | "node_farmID" | "node_twinID" | "node_country" | "node_city" | "node_uptime" | "node_created" | "node_farmingPolicyId" | "node_certification" | "node_secure" | "node_virtualized" | "node_serialNumber" | "node_createdAt" | "node_updatedAt" | "node_connectionPrice" | "ipv4" | "ipv6" | "gw4" | "gw6" | "domain";
    Location: "id" | "longitude" | "latitude";
    PricingPolicy: "id" | "gridVersion" | "pricingPolicyID" | "name" | "su_value" | "su_unit" | "cu_value" | "cu_unit" | "nu_value" | "nu_unit" | "ipu_value" | "ipu_unit" | "foundationAccount" | "certifiedSalesAccount" | "dedicatedNodeDiscount";
    Country: "id" | "countryID" | "code" | "name" | "region" | "subregion" | "lat" | "long";
    City: "id" | "cityID" | "countryID" | "name";
    NodeContract: "id" | "gridVersion" | "contractID" | "twinID" | "nodeID" | "deploymentData" | "deploymentHash" | "numberOfPublicIPs" | "state" | "resourcesUsed_id" | "resourcesUsed_hru" | "resourcesUsed_sru" | "resourcesUsed_cru" | "resourcesUsed_mru" | "createdAt" | "solutionProviderID";
    ContractResources: "id" | "contract_id" | "contract_gridVersion" | "contract_contractID" | "contract_twinID" | "contract_nodeID" | "contract_deploymentData" | "contract_deploymentHash" | "contract_numberOfPublicIPs" | "contract_state" | "contract_createdAt" | "contract_solutionProviderID" | "hru" | "sru" | "cru" | "mru";
    NameContract: "id" | "gridVersion" | "contractID" | "twinID" | "name" | "state" | "createdAt" | "solutionProviderID";
    RentContract: "id" | "gridVersion" | "contractID" | "twinID" | "nodeID" | "state" | "createdAt" | "solutionProviderID";
    SolutionProvider: "id" | "solutionProviderID" | "description" | "link" | "approved";
    NruConsumption: "id" | "contractID" | "timestamp" | "window" | "nru";
    ContractBillReport: "id" | "contractID" | "discountReceived" | "amountBilled" | "timestamp";
    FarmingPolicy: "id" | "gridVersion" | "farmingPolicyID" | "name" | "cu" | "su" | "nu" | "ipv4" | "minimalUptime" | "policyCreated" | "policyEnd" | "immutable" | "default" | "nodeCertification" | "farmCertification";
    UptimeEvent: "id" | "nodeID" | "uptime" | "timestamp";
    MintTransaction: "id" | "amount" | "target" | "block";
    BurnTransaction: "id" | "block" | "amount" | "target";
    RefundTransaction: "id" | "block" | "amount" | "target" | "txHash";
}

// prettier-ignore
interface _W {
    Node: 
        BaseWhere<"gridVersion" |"nodeID" |"farmID" |"twinID" |"created" |"farmingPolicyId" | "connectionPrice", Int> &
        BaseWhere<"uptime" | "createdAt" | "updatedAt", bigint> &
        StringWhere<"id" | "country" | "city" | "serialNumber"> &
        NullWhere<"country" | "city" | "uptime" | "certification" | "secure" | "virtualized" | "serialNumber" | "connectionPrice"> &
        ArrayWhere<"interfaces", Where["Interfaces"]> &
        EnumWhere<"certification", NodeCertification> &
        BoolWhere<"secure" | "virtualized"> &
        { location?: Where["Location"]; publicConfig?: Where["PublicConfig"]; resourcesTotal?: Where["NodeResourcesTotal"]; };

    Account:
        StringWhere<"id" | "wallet"> &
        BaseWhere<"balance", bigint> &
        ArrayWhere<"historicalBalances", Where["HistoricalBalance"]>;

    BurnTransaction:
        StringWhere<"id" | "target"> &
        BaseWhere<"block", Int> &
        BaseWhere<"amount", bigint>;

    City:
        StringWhere<"id" | "name"> &
        BaseWhere<"cityID" | "countryID", Int>;

    ContractBillReport:
        StringWhere<"id"> &
        BaseWhere<"contractID" | "amountBilled" | "timestamp", bigint> &
        EnumWhere<"discountReceived", DiscountLevel>;

    ContractResources:
        StringWhere<"id"> &
        BaseWhere<"hru" | "src" | "cru" | "mru", bigint> &
        { contract?: Where["NodeContract"]; };

    Country:
        StringWhere<"id" | "code" | "name" | "region" | "subregion" | "lat" | "long"> &
        BaseWhere<"countryID", Int> &
        NullWhere<"lat" | "long">;

    EntityProof:
        StringWhere<"id" | "signature"> &
        BaseWhere<"entityID", Int> &
        { twinRel?: Where["Twin"] };

    FarmingPolicy:
        StringWhere<"id" | "name"> &
        BaseWhere<"gridVersion" | "farmingPolicyID" | "cu" | "su" | "nu" | "ipv4" | "minimalUptime" | "policyCreated" | "policyEnd", Int> &
        NullWhere<"name" | "cu" | "su" | "nu" | "ipv4" | "minimalUptime" | "policyCreated" | "policyEnd" | "immutable" | "default" | "nodeCertification" | "armCertification"> & 
        BoolWhere<"immutable" | "default"> &
        EnumWhere<"nodeCertification", NodeCertification> &
        EnumWhere<"farmCertification", FarmCertification>;

    Farm:
        StringWhere<"id" | "name" | "stellarAddress"> &
        BaseWhere<"gridVersion" | "farmID" | "twinID" | "pricingPolicyID", Int> &
        NullWhere<"certification" | "stellarAddress" | "dedicatedFarm"> &
        ArrayWhere<"publicIPs", Where["PublicIp"]> &
        BoolWhere<"dedicatedFarm"> &
        EnumWhere<"certification", FarmCertification>;

    HistoricalBalance:
        StringWhere<"id"> &
        BaseWhere<"balance" | "timestamp", bigint> &
        { account?: Where["Account"] };

    Interfaces:
        StringWhere<"id" | "name" | "mac" | "ips"> &
        { node?: Where["Node"] };

    Location: StringWhere<"id" | "longitude" | "latitude">;

    MintTransaction:
        StringWhere<"id" | "target"> &
        BaseWhere<"amount", bigint> &
        BaseWhere<"block", Int>;

    NameContract:
        StringWhere<"id" | "name"> &
        BaseWhere<"gridVersion" | "twinID", Int> &
        BaseWhere<"contractID", bigint> &
        EnumWhere<"state", ContractState>;

    NodeContract:
        StringWhere<"id" | "deploymentData" | "deploymentHash"> &
        BaseWhere<"gridVersion" | "twinID" | "nodeID" | "numberOfPublicIPs" | "solutionProviderID", Int> &
        BaseWhere<"contractID" | "createdAt", bigint> &
        EnumWhere<"state", ContractState> &
        NullWhere<"resourcesUsed" | "solutionProviderID"> &
        { resourcesUsed?: Where["ContractResources"] };

    NodeResourcesTotal:
        StringWhere<"id"> &
        BaseWhere<"hru" | "sru" | "cru" | "mru", bigint> &
        { node?: Where["Node"] };

    NruConsumption:
        StringWhere<"id"> &
        BaseWhere<"contractID" | "timestamp" | "window" | "nru", bigint> &
        NullWhere<"window" | "nru">;

    PricingPolicy:
        StringWhere<"id" | "name" | "foundationAccount" | "certifiedSalesAccount"> &
        BaseWhere<"gridVersion" | "pricingPolicyID" | "dedicatedNodeDiscount", Int> &
        { su?: Where["PricingPolicy"], cu?: Where["PricingPolicy"], nu?: Where["PricingPolicy"], ipu?: Where["PricingPolicy"] };

    PublicConfig:
        StringWhere<"id" | "ipv4" | "ipv6" | "gw4" | "gw6" | "domain"> &
        NullWhere<"ipv4" | "ipv6" | "gw4" | "gw6" | "domain"> &
        { node?: Where["Node"] };

    PublicIp:
        StringWhere<"id" | "gateway" | "ip"> &
        BaseWhere<"contractId", bigint> &
        { farm?: Where["Farm"] };
    
    RefundTransaction:
        StringWhere<"id" | "target" | "txHash"> &
        BaseWhere<"block", Int> &
        BaseWhere<"amount", bigint>;

    RentContract:
        StringWhere<"id"> &
        BaseWhere<"gridVersion" | "twinID" | "nodeID" | "solutionProviderID", Int> &
        BaseWhere<"contractID" | "createdAt", bigint> &
        EnumWhere<"state", ContractState> &
        NullWhere<"solutionProviderID">;

    SolutionProvider:
        StringWhere<"id" | "description" | "link"> &
        BaseWhere<"solutionProviderID", bigint> &
        BoolWhere<"approved"> &
        NullWhere<"providers">;

    Transfer:
        StringWhere<"id" | "from" | "to"> &
        BaseWhere<"amount" | "timestamp", bigint>;

    Twin:
        StringWhere<"id" | "accountID" | "ip"> &
        BaseWhere<"gridVersion" | "twinID", Int>;
    
    UptimeEvent:
        StringWhere<"id"> &
        BaseWhere<"nodeID", Int> &
        BaseWhere<"uptime" | "timestamp", bigint>;
}

interface Where {
  Node: AbstractWhere<_W["Node"]>;
  Account: AbstractWhere<_W["Account"]>;
  BurnTransaction: AbstractWhere<_W["BurnTransaction"]>;
  City: AbstractWhere<_W["City"]>;
  ContractBillReport: AbstractWhere<_W["ContractBillReport"]>;
  ContractResources: AbstractWhere<_W["ContractResources"]>;
  Country: AbstractWhere<_W["Country"]>;
  EntityProof: AbstractWhere<_W["EntityProof"]>;
  FarmingPolicy: AbstractWhere<_W["FarmingPolicy"]>;
  Farm: AbstractWhere<_W["Farm"]>;
  HistoricalBalance: AbstractWhere<_W["HistoricalBalance"]>;
  Interfaces: AbstractWhere<_W["Interfaces"]>;
  Location: AbstractWhere<_W["Location"]>;
  MintTransaction: AbstractWhere<_W["MintTransaction"]>;
  NameContract: AbstractWhere<_W["NameContract"]>;
  NodeContract: AbstractWhere<_W["NodeContract"]>;
  NodeResourcesTotal: AbstractWhere<_W["NodeResourcesTotal"]>;
  NruConsumption: AbstractWhere<_W["NruConsumption"]>;
  PricingPolicy: AbstractWhere<_W["PricingPolicy"]>;
  PublicConfig: AbstractWhere<_W["PublicConfig"]>;
  PublicIp: AbstractWhere<_W["PublicIp"]>;
  RefundTransaction: AbstractWhere<_W["RefundTransaction"]>;
  RentContract: AbstractWhere<_W["RentContract"]>;
  SolutionProvider: AbstractWhere<_W["SolutionProvider"]>;
  Transfer: AbstractWhere<_W["Transfer"]>;
  Twin: AbstractWhere<_W["Twin"]>;
  UptimeEvent: AbstractWhere<_W["UptimeEvent"]>;
}

// prettier-ignore
export interface ListQueries {
  nodes<T extends PartialBoolean<Node>>(fields: T, options?: ByArray<OrderBy["Node"], Where["Node"]>): Promise<FitType<T, Node>[]>;
  accounts<T extends PartialBoolean<Account>>(fields: T,options?: ByArray<OrderBy["Account"], Where["Account"]>): Promise<FitType<T, Account>[]>;
  burnTransactions<T extends PartialBoolean<BurnTransaction>>(fields: T,options?: ByArray<OrderBy["BurnTransaction"], Where["BurnTransaction"]>): Promise<FitType<T, BurnTransaction>[]>;
  cities<T extends PartialBoolean<City>>(fields: T, options?: ByArray<OrderBy["City"], Where["City"]>): Promise<FitType<T, City>[]>;
  contractBillReports<T extends PartialBoolean<ContractBillReport>>(fields: T,options?: ByArray<OrderBy["ContractBillReport"], Where["ContractBillReport"]>): Promise<FitType<T, ContractBillReport>[]>;
  contractResources<T extends PartialBoolean<ContractResources>>(fields: T,options?: ByArray<OrderBy["ContractResources"], Where["ContractResources"]>): Promise<FitType<T, ContractResources>[]>;
  countries<T extends PartialBoolean<Country>>(fields: T,options?: ByArray<OrderBy["Country"], Where["Country"]>): Promise<FitType<T, Country>[]>;
  entityProofs<T extends PartialBoolean<EntityProof>>(fields: T,options?: ByArray<OrderBy["EntityProof"], Where["EntityProof"]>): Promise<FitType<T, EntityProof>[]>;
  farmingPolicies<T extends PartialBoolean<FarmingPolicy>>(fields: T,options?: ByArray<OrderBy["FarmingPolicy"], Where["FarmingPolicy"]>): Promise<FitType<T, FarmingPolicy>[]>;
  farms<T extends PartialBoolean<Farm>>(fields: T, options?: ByArray<OrderBy["Farm"], Where["Farm"]>): Promise<FitType<T, Farm>[]>;
  historicalBalances<T extends PartialBoolean<HistoricalBalance>>(fields: T,options?: ByArray<OrderBy["HistoricalBalance"], Where["HistoricalBalance"]>): Promise<FitType<T, HistoricalBalance>[]>;
  interfaces<T extends PartialBoolean<Interfaces>>(fields: T,options?: ByArray<OrderBy["Interfaces"], Where["Interfaces"]>): Promise<FitType<T, Interfaces>[]>;
  locations<T extends PartialBoolean<Location>>(fields: T,options?: ByArray<OrderBy["Location"], Where["Location"]>): Promise<FitType<T, Location>[]>;
  mintTransactions<T extends PartialBoolean<MintTransaction>>(fields: T,options?: ByArray<OrderBy["MintTransaction"], Where["MintTransaction"]>): Promise<FitType<T, MintTransaction>[]>;
  nameContracts<T extends PartialBoolean<NameContract>>(fields: T,options?: ByArray<OrderBy["NameContract"], Where["NameContract"]>): Promise<FitType<T, NameContract>[]>;
  nodeContracts<T extends PartialBoolean<NodeContract>>(fields: T,options?: ByArray<OrderBy["NodeContract"], Where["NodeContract"]>): Promise<FitType<T, NodeContract>[]>;
  nodeResourcesTotals<T extends PartialBoolean<NodeResourcesTotal>>(fields: T,options?: ByArray<OrderBy["NodeResourcesTotal"], Where["NodeResourcesTotal"]>): Promise<FitType<T, NodeResourcesTotal>[]>;
  nruConsumptions<T extends PartialBoolean<NruConsumption>>(fields: T,options?: ByArray<OrderBy["NruConsumption"], Where["NruConsumption"]>): Promise<FitType<T, NruConsumption>[]>;
  pricingPolicies<T extends PartialBoolean<PricingPolicy>>(fields: T,options?: ByArray<OrderBy["PricingPolicy"], Where["PricingPolicy"]>): Promise<FitType<T, PricingPolicy>[]>;
  publicConfigs<T extends PartialBoolean<PublicConfig>>(fields: T,options?: ByArray<OrderBy["PublicConfig"], Where["PublicConfig"]>): Promise<FitType<T, PublicConfig>[]>;
  publicIps<T extends PartialBoolean<PublicIp>>(fields: T,options?: ByArray<OrderBy["PublicIp"], Where["PublicIp"]>): Promise<FitType<T, PublicIp>[]>;
  refundTransactions<T extends PartialBoolean<RefundTransaction>>(fields: T,options?: ByArray<OrderBy["RefundTransaction"], Where["RefundTransaction"]>): Promise<FitType<T, RefundTransaction>[]>;
  rentContracts<T extends PartialBoolean<RentContract>>(fields: T,options?: ByArray<OrderBy["RentContract"], Where["RentContract"]>): Promise<FitType<T, RentContract>[]>;
  solutionProviders<T extends PartialBoolean<SolutionProvider>>(fields: T,options?: ByArray<OrderBy["SolutionProvider"], Where["SolutionProvider"]>): Promise<FitType<T, SolutionProvider>[]>;
  transfers<T extends PartialBoolean<Transfer>>(fields: T,options?: ByArray<OrderBy["Transfer"], Where["Transfer"]>): Promise<FitType<T, Transfer>[]>;
  twins<T extends PartialBoolean<Twin>>(fields: T, options?: ByArray<OrderBy["Twin"], Where["Twin"]>): Promise<FitType<T, Twin>[]>;
  uptimeEvents<T extends PartialBoolean<UptimeEvent>>(fields: T,options?: ByArray<OrderBy["UptimeEvent"], Where["UptimeEvent"]>): Promise<FitType<T, UptimeEvent>[]>;
}
