import {
    BlockchainAssetsModel,
    BlockchainCreateModel,
    BlockchainCreateResultModel,
    BlockchainDeleteModel,
    BlockchainGetModel,
    BlockchainGetResultModel,
    BlockchainInitModel,
    BlockchainListModel,
    BlockchainListResultModel,
    BlockchainPayModel,
    BlockchainSignModel,
} from ".";

export enum blockchainType {
    algorand = "algorand",
    stellar = "stellar",
    tfchain = "tfchain",
}

interface blockchainInterface {
    create(options: BlockchainCreateModel): Promise<BlockchainCreateResultModel>;

    init(options: BlockchainInitModel);

    delete(options: BlockchainDeleteModel);

    list(options: BlockchainListModel): Promise<BlockchainListResultModel[]>;

    select?(options: BlockchainGetModel);

    get(options: BlockchainGetModel): Promise<BlockchainGetResultModel>;

    assets(options: BlockchainGetModel): Promise<BlockchainAssetsModel>;

    sign(options: BlockchainSignModel);

    pay(options: BlockchainPayModel);
}

export default blockchainInterface;
