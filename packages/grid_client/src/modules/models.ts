import { ISubmittableResult } from "@polkadot/types/types";
import { default as AlgoSdk } from "algosdk";
import { Expose, Transform, Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsAlphanumeric,
    IsBoolean,
    IsDefined,
    IsEnum,
    IsInt,
    IsIP,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
    ValidateNested,
} from "class-validator";

import { Deployment } from "../zos/deployment";
import { ZdbModes } from "../zos/zdb";
import { blockchainType } from "./blockchainInterface";
const NameLength = 15;

enum ContractStates {
    Created = "Created",
    Deleted = "Deleted",
    OutOfFunds = "OutOfFunds",
    GracePeriod = "GracePeriod",
}

//TODO: find a way to validate all fields are passed while casting data to any of these classes.
class AlgorandAccountCreateModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}
class AlgorandAccountInitModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() secret: string;
}
class AlgorandAccountAssetsFromAddressModel {
    @Expose() @IsString() @IsNotEmpty() address: string;
}

class AlgorandCreateTransactionModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() address_dest: string;
    @Expose() @IsNumber() @IsNotEmpty() amount: number;
    @Expose() @IsOptional() description: string;
}
class AlgorandTransferModel extends AlgorandCreateTransactionModel {}
class AlgorandSignatureModel {
    @Expose() @IsNotEmpty() txn: AlgoSdk.Transaction;
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}
class DiskModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @Min(0.25) size: number; // in GB
    @Expose() @IsString() @IsNotEmpty() mountpoint: string;
}

class QSFSDiskModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) qsfs_zdbs_name: string;
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() prefix: string;
    @Expose() @IsString() @IsNotEmpty() encryption_key: string;
    @Expose() @Min(0.25) @IsOptional() cache?: number; // in GB
    @Expose() @IsInt() @Min(1) @IsOptional() minimal_shards?: number;
    @Expose() @IsInt() @Min(2) @IsOptional() expected_shards?: number;
    @Expose() @IsString() @IsNotEmpty() mountpoint: string;
}

class NetworkModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() ip_range: string;
    @Expose() @IsBoolean() @IsOptional() addAccess?: boolean;
}

class BaseGetDeleteModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class MachineModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @IsOptional() @Type(() => DiskModel) @ValidateNested({ each: true }) disks?: DiskModel[];
    @Expose() @IsOptional() @Type(() => QSFSDiskModel) @ValidateNested({ each: true }) qsfs_disks?: QSFSDiskModel[];
    @Expose() @IsBoolean() public_ip: boolean;
    @Expose() @IsOptional() @IsBoolean() public_ip6?: boolean;
    @Expose() @IsBoolean() planetary: boolean;
    @Expose() @IsInt() @Min(1) cpu: number;
    @Expose() @Min(256) memory: number; // in MB
    @Expose() rootfs_size: number; // in GB
    @Expose() @IsUrl() @IsNotEmpty() flist: string;
    @Expose() @IsString() @IsDefined() entrypoint: string;
    @Expose() env: Record<string, unknown>;
    @Expose() @IsOptional() @IsIP() ip?: string;
    @Expose() @IsOptional() @IsBoolean() corex?: boolean;
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
    @Expose() @IsString() @IsOptional() zlogsOutput?: string;
}

class MachinesModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @Type(() => NetworkModel) @ValidateNested() network: NetworkModel;
    @Expose() @Type(() => MachineModel) @ValidateNested({ each: true }) machines: MachineModel[];
    @Expose() @IsString() @IsOptional() metadata?: string;
    @Expose() @IsString() @IsOptional() description?: string;
}

class AddMachineModel extends MachineModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) deployment_name: string;
}

class DeleteMachineModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) deployment_name: string;
}

class MachinesGetModel extends BaseGetDeleteModel {}

class MachinesDeleteModel extends BaseGetDeleteModel {}

class KubernetesNodeModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @IsInt() @Min(1) cpu: number;
    @Expose() @Min(1024) memory: number; // in MB
    @Expose() rootfs_size: number; // in GB
    @Expose() @Min(0.25) disk_size: number; // in GB
    @Expose() @IsOptional() @Type(() => QSFSDiskModel) @ValidateNested({ each: true }) qsfs_disks?: QSFSDiskModel[];
    @Expose() @IsBoolean() public_ip: boolean;
    @Expose() @IsOptional() @IsBoolean() public_ip6: boolean;
    @Expose() @IsBoolean() planetary: boolean;
    @Expose() @IsOptional() @IsIP() ip?: string;
    @Expose() @IsOptional() @IsBoolean() corex?: boolean;
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
    @Expose() @IsString() @IsOptional() zlogsOutput?: string;
}

class K8SModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() secret: string;
    @Expose() @Type(() => NetworkModel) @ValidateNested() network: NetworkModel;
    @Expose() @Type(() => KubernetesNodeModel) @ValidateNested({ each: true }) masters: KubernetesNodeModel[];
    @Expose() @Type(() => KubernetesNodeModel) @ValidateNested({ each: true }) workers?: KubernetesNodeModel[];
    @Expose() @IsString() @IsOptional() metadata?: string;
    @Expose() @IsString() @IsOptional() description?: string;
    @Expose() @IsString() @IsNotEmpty() ssh_key: string; // is not optional as if the user forget it, he will not be able to use the cluster.
}

class K8SGetModel extends BaseGetDeleteModel {}

class K8SDeleteModel extends BaseGetDeleteModel {}

class AddWorkerModel extends KubernetesNodeModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) deployment_name: string;
}

class DeleteWorkerModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) deployment_name: string;
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class ZDBModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @Transform(({ value }) => ZdbModes[value]) @IsEnum(ZdbModes) mode: ZdbModes;
    @Expose() @Min(0.25) disk_size: number; // in GB
    @Expose() @IsBoolean() publicNamespace: boolean;
    @Expose() @IsString() @IsNotEmpty() password: string;
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
}

class ZDBSModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @Type(() => ZDBModel) @ValidateNested({ each: true }) zdbs: ZDBModel[];
    @Expose() @IsString() @IsOptional() metadata?: string;
    @Expose() @IsString() @IsOptional() description?: string;
}

class ZDBGetModel extends BaseGetDeleteModel {}

class ZDBDeleteModel extends BaseGetDeleteModel {}

class AddZDBModel extends ZDBModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) deployment_name: string;
}

class DeleteZDBModel extends DeleteWorkerModel {}

class QSFSZDBSModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @Min(3) count: number;
    @Expose() @ArrayNotEmpty() @IsInt({ each: true }) @Min(1, { each: true }) node_ids: number[];
    @Expose() @Min(0.25) disk_size: number;
    @Expose() @IsString() @IsNotEmpty() password: string;
    @Expose() @IsString() @IsOptional() metadata?: string;
    @Expose() @IsString() @IsOptional() description?: string;
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
}

class QSFSZDBGetModel extends BaseGetDeleteModel {}

class QSFSZDBDeleteModel extends BaseGetDeleteModel {}

class GatewayFQDNModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @IsString() @IsNotEmpty() fqdn: string;
    @Expose() @IsBoolean() tls_passthrough: boolean;
    @Expose() @IsString() @IsOptional() metadata?: string;
    @Expose() @IsString() @IsOptional() description?: string;
    @Expose() @ArrayNotEmpty() @IsUrl({ protocols: ["http", "https"] }, { each: true }) backends: string[];
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
}

class GatewayFQDNGetModel extends BaseGetDeleteModel {}

class GatewayFQDNDeleteModel extends BaseGetDeleteModel {}

class BaseGatewayNameModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength + 10) name: string;
}

class GatewayNameModel extends BaseGatewayNameModel {
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @IsBoolean() tls_passthrough: boolean;
    @Expose() @IsString() @IsOptional() metadata?: string;
    @Expose() @IsString() @IsOptional() description?: string;
    @Expose() @ArrayNotEmpty() @IsUrl({ protocols: ["http", "https"] }, { each: true }) backends: string[];
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
}

class GatewayNameGetModel extends BaseGatewayNameModel {}

class GatewayNameDeleteModel extends BaseGatewayNameModel {}

class ZOSModel extends Deployment {
    @Expose() @IsInt() @Min(1) node_id: number;
}

class ZOSGetDeploymentModel {
    @Expose() @IsInt() @Min(1) contractId: number;
}

class NodeContractCreateModel {
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @IsString() @IsNotEmpty() hash: string;
    @Expose() @IsString() @IsDefined() data: string;
    @Expose() @IsInt() @Min(0) public_ip: number;
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
}

class NameContractCreateModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}
class RentContractCreateModel {
    @Expose() @IsInt() @IsNotEmpty() nodeId: number;
    @Expose() @IsInt() @IsOptional() solutionProviderID?: number;
}
class RentContractGetModel {
    @Expose() @IsInt() @IsNotEmpty() nodeId: number;
}

class RentContractDeleteModel {
    @Expose() @IsInt() @IsNotEmpty() nodeId: number;
}
class ContractGetModel {
    @Expose() @IsInt() @Min(1) id: number;
}

class ContractGetByNodeIdAndHashModel {
    @Expose() @IsInt() @Min(1) node_id: number;
    @Expose() @IsString() @IsNotEmpty() hash: string;
}

class CreateServiceContractModel {
    @Expose() @IsString() @IsNotEmpty() serviceAccount: string;
    @Expose() @IsString() @IsNotEmpty() consumerAccount: string;
}

class ServiceContractApproveModel {
    @Expose() @IsInt() @Min(1) serviceContractId: number;
    @Expose() @IsBoolean() approve: boolean;
}

class ServiceContractBillModel {
    @Expose() @IsInt() @Min(1) serviceContractId: number;
    @Expose() @IsInt() @Min(1) variableAmount: number;
    @Expose() @IsString() @IsNotEmpty() metadata: string;
}

class ServiceContractCancelModel {
    @Expose() @IsInt() @Min(1) serviceContractId: number;
}
class SetServiceContractFeesModel {
    @Expose() @IsInt() @Min(1) serviceContractId: number;
    @Expose() @IsInt() @Min(1) baseFee: number;
    @Expose() @IsInt() @Min(1) variableFee: number;
}
class SetServiceContractMetadataModel {
    @Expose() @IsInt() @Min(1) serviceContractId: number;
    @Expose() @IsString() @IsNotEmpty() metadata: string;
}

class GetServiceContractModel {
    @Expose() @IsInt() @Min(1) serviceContractId: number;
}
class NameContractGetModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class NodeContractUpdateModel {
    @Expose() @IsInt() @Min(1) id: number;
    @Expose() @IsString() @IsNotEmpty() hash: string;
    @Expose() @IsString() @IsDefined() data: string;
}

class ContractCancelModel {
    @Expose() @IsInt() @Min(1) id: number;
}

class BatchCancelContractsModel {
    @Expose() @ArrayNotEmpty() @IsInt({ each: true }) @Min(1, { each: true }) ids: number[];
}

class ContractsByTwinId {
    @Expose() @IsInt() @Min(1) twinId: number;
}

class ContractsByAddress {
    @Expose() @IsString() @IsNotEmpty() address: string;
}

class ContractConsumption {
    @Expose() @IsInt() @Min(1) id: number;
}

class TwinCreateModel {
    @Expose() @IsString() @IsNotEmpty() relay: string;
}

class TwinGetModel {
    @Expose() @IsInt() @Min(1) id: number;
}

class TwinGetByAccountIdModel {
    @Expose() @IsString() @IsNotEmpty() public_key: string;
}

class TwinDeleteModel {
    @Expose() @IsInt() @Min(1) id: number;
}

class KVStoreSetModel {
    @Expose() @IsString() @IsNotEmpty() key: string;
    @Expose() @IsString() @IsNotEmpty() value: string;
}
class KVStoreGetModel {
    @Expose() @IsString() @IsNotEmpty() key: string;
}
class KVStoreRemoveModel {
    @Expose() @IsString() @IsNotEmpty() key: string;
}

class KVStoreBatchRemoveModel {
    @Expose() @ArrayNotEmpty() @IsString({ each: true }) keys: string[];
}

class BalanceGetModel {
    @Expose() @IsString() @IsNotEmpty() address: string;
}

class BalanceTransferModel {
    @Expose() @IsString() @IsNotEmpty() address: string;
    @Expose() @Min(0.0000001) amount: number;
}

class StellarWalletVerifyModel {
    @Expose() @IsString() @IsNotEmpty() public_key: string;
    @Expose() @IsString() @IsNotEmpty() content: string;
    @Expose() @IsString() @IsNotEmpty() signedContent: string;
}

class StellarWalletBalanceByAddressModel {
    @Expose() @IsString() @IsNotEmpty() address: string;
}

class StellarWalletTransferModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() address_dest: string;
    @Expose() @Min(0.0000001) amount: number;
    @Expose() @IsString() @IsNotEmpty() asset: string;
    @Expose() @IsString() @IsOptional() description?: string;
}

class StellarWalletCreateModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class StellarWalletInitModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() secret: string;
}

class TfchainWalletInitModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() secret: string;
}

class TfchainWalletBalanceByAddressModel {
    @Expose() @IsString() @IsNotEmpty() address: string;
}

class TfchainWalletTransferModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() address_dest: string;
    @Expose() @Min(0.0000001) amount: number;
}

class TfchainCreateModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() relay?: string;
}

class BlockchainListResultModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() public_key: string;
    @Expose() @Transform(({ value }) => blockchainType[value]) @IsEnum(blockchainType) blockchain_type: blockchainType;
}

class BlockchainCreateResultModel extends BlockchainListResultModel {
    @Expose() @IsString() @IsNotEmpty() mnemonic?: string;
    @Expose() @IsString() @IsNotEmpty() secret?: string;
    @Expose() @IsNumber() @IsOptional() twinId?: number;
}

class BlockchainGetResultModel extends BlockchainCreateResultModel {}

class BlockchainAssetModel {
    @Expose() @IsString() @IsNotEmpty() asset: string;
    @Expose() amount: number;
}

class BlockchainAssetsModel extends BlockchainListResultModel {
    @Expose() @Type(() => BlockchainAssetModel) @ValidateNested({ each: true }) assets: BlockchainAssetModel[];
}

class BlockchainCreateModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @Transform(({ value }) => blockchainType[value]) @IsEnum(blockchainType) blockchain_type: blockchainType;
    @Expose() @IsString() @IsOptional() relay?: string;
}

class BlockchainGetModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class BlockchainDeleteModel extends BlockchainGetModel {}

class BlockchainListModel {
    @Expose()
    @Transform(({ value }) => blockchainType[value])
    @IsOptional()
    @IsEnum(blockchainType)
    blockchain_type?: blockchainType;
}

class BlockchainInitModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @Transform(({ value }) => blockchainType[value]) @IsEnum(blockchainType) blockchain_type: blockchainType;
    @Expose() @IsString() @IsNotEmpty() secret: string;
}

class BlockchainSignModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
    @Expose() @IsString() @IsNotEmpty() content: string;
}

class BlockchainSignNoNameModel {
    @Expose() @IsString() @IsNotEmpty() content: string;
}

class BlockchainPayNoNameModel {
    @Expose()
    @Transform(({ value }) => blockchainType[value])
    @IsEnum(blockchainType)
    blockchain_type_dest: blockchainType;
    @Expose() @IsString() description: string;
    @Expose() @IsString() @IsNotEmpty() address_dest: string;
    @Expose() @Min(0.0000001) amount: number;
    @Expose() @IsString() @IsOptional() asset: string;
}

class BlockchainPayModel extends BlockchainPayNoNameModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class WalletMessageSignModel {
    @Expose() @IsString() @IsNotEmpty() message: string;
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

class FarmsGetModel {
    @Expose() @IsInt() @Min(1) @IsOptional() page?: number; // default 1
    @Expose() @IsInt() @Min(1) @IsOptional() maxResult?: number; // default 50
}

class NodesGetModel extends FarmsGetModel {}

class FarmHasFreePublicIPsModel {
    @Expose() @IsInt() @Min(1) farmId: number;
}

class NodesByFarmIdModel extends FarmHasFreePublicIPsModel {}

class ContractState {
    @Expose() @IsEnum(ContractStates, { each: true }) state: ContractStates[];
}

class NodeFreeResourcesModel {
    @Expose() @IsInt() @Min(1) nodeId: number;
}

class FarmIdFromFarmNameModel {
    @Expose() @IsString() @IsNotEmpty() farmName: string;
}

class PingNodeOptionsModel {
    @Expose() @IsInt() @Min(1) nodeId: number;
}
class FilterOptions {
    @Expose() @IsOptional() @Min(0) cru?: number;
    @Expose() @IsOptional() @Min(0) mru?: number; // GB
    @Expose() @IsOptional() @Min(0) sru?: number; // GB
    @Expose() @IsOptional() @Min(0) hru?: number; // GB
    @Expose() @IsOptional() @IsBoolean() publicIPs?: boolean;
    @Expose() @IsOptional() @IsBoolean() accessNodeV4?: boolean;
    @Expose() @IsOptional() @IsBoolean() accessNodeV6?: boolean;
    @Expose() @IsOptional() @IsBoolean() gateway?: boolean;
    @Expose() @IsOptional() @IsBoolean() certified?: boolean;
    @Expose() @IsOptional() @IsInt({ each: true }) @Min(1, { each: true }) nodeExclude?: number[];
    @Expose() @IsOptional() @IsInt() @Min(1) farmId?: number;
    @Expose() @IsOptional() @IsString() farmName?: string;
    @Expose() @IsOptional() @IsString() country?: string;
    @Expose() @IsOptional() @IsString() city?: string;
    @Expose() @IsOptional() @IsBoolean() dedicated?: boolean;
    @Expose() @IsOptional() @IsInt() availableFor?: number;
    @Expose() @IsOptional() @IsInt() page?: number;
    @Expose() @IsOptional() @IsInt() size?: number;
}

class CalculatorModel {
    @Expose() @IsInt() @IsNotEmpty() @Min(0) cru: number; // vCores
    @Expose() @IsNumber() @IsNotEmpty() @Min(0) mru: number; // GB
    @Expose() @IsNumber() @IsNotEmpty() @Min(0) sru: number; // GB
    @Expose() @IsNumber() @IsNotEmpty() @Min(0) hru: number; // GB
    @Expose() @IsOptional() @IsNumber() @Min(0) balance?: number; // GB
}

class CUModel {
    @Expose() @IsInt() @IsNotEmpty() @Min(0) cru: number; // vCores
    @Expose() @IsNumber() @IsNotEmpty() @Min(0) mru: number; // GB
}

class SUModel {
    @Expose() @IsNumber() @IsNotEmpty() @Min(0) hru: number; // GB
    @Expose() @IsNumber() @IsNotEmpty() @Min(0) sru: number; // GB
}

class BatchModel {
    @ArrayNotEmpty() @ValidateNested({ each: true }) extrinsics: ISubmittableResult[];
}

class ZOSNodeModel {
    @Expose() @IsInt() @Min(1) nodeId: number;
}

class NodePowerModel {
    @Expose() @IsInt() @IsNotEmpty() @Min(1) nodeId: number;
    @Expose() @IsBoolean() @IsNotEmpty() power: boolean;
}

class FarmIdModel {
    @Expose() @IsInt() @IsNotEmpty() @Min(1) farmId: number;
}

class pingFarmModel {
    @Expose() @IsInt() @IsNotEmpty() @Min(1) farmId: number;
}

class NetworkGetModel {
    @Expose() @IsString() @IsNotEmpty() @IsAlphanumeric() @MaxLength(NameLength) name: string;
}

export {
    AlgorandAccountCreateModel,
    AlgorandAccountInitModel,
    AlgorandAccountAssetsFromAddressModel,
    AlgorandSignatureModel,
    AlgorandCreateTransactionModel,
    AlgorandTransferModel,
    DiskModel,
    NetworkModel,
    MachineModel,
    MachinesModel,
    MachinesGetModel,
    MachinesDeleteModel,
    AddMachineModel,
    DeleteMachineModel,
    KubernetesNodeModel,
    K8SModel,
    K8SGetModel,
    K8SDeleteModel,
    AddWorkerModel,
    DeleteWorkerModel,
    ZDBModel,
    ZDBSModel,
    ZDBGetModel,
    ZDBDeleteModel,
    AddZDBModel,
    DeleteZDBModel,
    GatewayFQDNModel,
    GatewayNameModel,
    ZOSModel,
    QSFSDiskModel,
    QSFSZDBSModel,
    QSFSZDBGetModel,
    QSFSZDBDeleteModel,
    NodeContractCreateModel,
    NameContractCreateModel,
    RentContractCreateModel,
    RentContractGetModel,
    RentContractDeleteModel,
    ContractGetModel,
    ContractGetByNodeIdAndHashModel,
    NameContractGetModel,
    NodeContractUpdateModel,
    ContractCancelModel,
    BatchCancelContractsModel,
    ContractsByTwinId,
    ContractsByAddress,
    ContractConsumption,
    TwinCreateModel,
    TwinGetModel,
    TwinGetByAccountIdModel,
    TwinDeleteModel,
    KVStoreSetModel,
    KVStoreGetModel,
    KVStoreRemoveModel,
    KVStoreBatchRemoveModel,
    BalanceGetModel,
    BalanceTransferModel,
    StellarWalletCreateModel,
    StellarWalletVerifyModel,
    StellarWalletBalanceByAddressModel,
    StellarWalletTransferModel,
    StellarWalletInitModel,
    GatewayFQDNGetModel,
    GatewayFQDNDeleteModel,
    GatewayNameGetModel,
    GatewayNameDeleteModel,
    FarmsGetModel,
    NodesGetModel,
    FarmHasFreePublicIPsModel,
    NodesByFarmIdModel,
    NodeFreeResourcesModel,
    FarmIdFromFarmNameModel,
    FilterOptions,
    ContractStates,
    ContractState,
    TfchainWalletInitModel,
    TfchainWalletBalanceByAddressModel,
    TfchainWalletTransferModel,
    TfchainCreateModel,
    WalletMessageSignModel,
    BlockchainCreateModel,
    BlockchainCreateResultModel,
    BlockchainInitModel,
    BlockchainGetModel,
    BlockchainDeleteModel,
    BlockchainListModel,
    BlockchainListResultModel,
    BlockchainAssetModel,
    BlockchainAssetsModel,
    BlockchainSignModel,
    BlockchainSignNoNameModel,
    BlockchainPayModel,
    BlockchainPayNoNameModel,
    BlockchainGetResultModel,
    PingNodeOptionsModel,
    CalculatorModel,
    CUModel,
    SUModel,
    BatchModel,
    ZOSGetDeploymentModel,
    ZOSNodeModel,
    NodePowerModel,
    FarmIdModel,
    pingFarmModel,
    CreateServiceContractModel,
    ServiceContractApproveModel,
    ServiceContractBillModel,
    ServiceContractCancelModel,
    SetServiceContractFeesModel,
    SetServiceContractMetadataModel,
    GetServiceContractModel,
    NetworkGetModel,
};
