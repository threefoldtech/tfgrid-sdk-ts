import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import {
    algorand,
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
    BlockchainPayNoNameModel,
    BlockchainSignModel,
    BlockchainSignNoNameModel,
    stellar,
    tfchain,
} from ".";
import blockchainInterface, { blockchainType } from "./blockchainInterface";

class Blockchain implements blockchainInterface {
    stellar: stellar;
    algorand: algorand;
    tfchain: tfchain;
    current_account: string;
    blockchain_type: blockchainType;

    constructor(config: GridClientConfig) {
        this.stellar = new stellar(config);
        this.algorand = new algorand(config);
        this.tfchain = new tfchain(config);
    }

    async exist_in(options: BlockchainGetModel): Promise<blockchainType> {
        if (await this.stellar.exist(options)) return blockchainType.stellar;
        else if (await this.algorand.exist(options)) return blockchainType.algorand;
        else if (await this.tfchain.exist(options)) return blockchainType.tfchain;
    }

    @expose
    @validateInput
    async exist(options: BlockchainGetModel) {
        return (
            (await this.stellar.exist({ name: options.name })) ||
            (await this.algorand.exist({ name: options.name })) ||
            (await this.tfchain.exist({ name: options.name }))
        );
    }

    @expose
    @validateInput
    async select(options: BlockchainGetModel) {
        const account_exists = await this.exist(options);

        if (!account_exists) throw Error(`Account ${options.name} doesn't exist`);

        this.current_account = options.name;
        this.blockchain_type = await this.exist_in(options);
    }

    @expose
    @validateInput
    async create(options: BlockchainCreateModel): Promise<BlockchainCreateResultModel> {
        const account_exists = await this.exist(options);

        if (account_exists) throw Error(`Name ${options.name} already exists`);

        return this[options.blockchain_type].create(options);
    }

    @expose
    @validateInput
    async sign(options: BlockchainSignNoNameModel) {
        if (!this.current_account) throw Error(`No account is selected. Please select an account first`);

        const modified_options: BlockchainSignModel = { name: this.current_account, content: options.content };

        return this[this.blockchain_type].sign(modified_options);
    }

    @expose
    @validateInput
    async init(options: BlockchainInitModel) {
        return this[options.blockchain_type].init(options);
    }

    @expose
    @validateInput
    async get(): Promise<BlockchainGetResultModel> {
        if (!this.current_account) throw Error(`No account is selected. Please select an account first`);

        const options = { name: this.current_account };

        return this[this.blockchain_type].get(options);
    }

    @expose
    @validateInput
    async list(options?: BlockchainListModel): Promise<BlockchainListResultModel[]> {
        if (!options || !options.blockchain_type) {
            const stellar_accounts = await this.stellar.list();
            const algorand_accounts = await this.algorand.list();
            const tfchain_accounts = await this.tfchain.list();
            return stellar_accounts.concat(algorand_accounts).concat(tfchain_accounts);
        }

        return this[options.blockchain_type].list();
    }

    @expose
    @validateInput
    async assets(): Promise<BlockchainAssetsModel> {
        if (!this.current_account) throw Error(`No account is selected. Please select an account first`);

        const options = { name: this.current_account };

        return this[this.blockchain_type].assets(options);
    }

    @expose
    @validateInput
    // TODO : bridge, still
    async pay(options: BlockchainPayNoNameModel) {
        if (!this.current_account) throw Error(`No account is selected. Please select an account first`);

        if (this.blockchain_type != options.blockchain_type_dest)
            throw Error(`Transfer between blockchains isn't implemented yet`);

        const modified_options: BlockchainPayModel = {
            name: this.current_account,
            blockchain_type_dest: options.blockchain_type_dest,
            description: options.description,
            address_dest: options.address_dest,
            amount: options.amount,
            asset: options.asset,
        };

        return this[this.blockchain_type].pay(modified_options);
    }

    @expose
    @validateInput
    async delete() {
        if (!this.current_account) throw Error(`No account is selected. Please select an account first`);

        const options: BlockchainDeleteModel = { name: this.current_account };

        return this[this.blockchain_type].delete(options);
    }
}

export { Blockchain as blockchain };
