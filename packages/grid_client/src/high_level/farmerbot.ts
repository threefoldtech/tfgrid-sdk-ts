import { Expose } from "class-transformer";
import { IsBoolean, IsDefined, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import uuid4 from "uuid4";

import { pingFarmModel, TFClient } from "..";
import { RMB } from "../clients/rmb";
import { GridClientConfig } from "../config";

class FarmBotArgs {
    @Expose() @IsOptional() args: string[];
}

class FarmBotParams {
    @Expose() @IsString() @IsOptional() key: string;
    @Expose() @IsOptional() value: Array<number> | boolean | number | string | undefined;
}
class FarmerBotActionJobPublicModel {
    @Expose() @IsString() @IsNotEmpty() guid: string; // this is a unique id that you can use to process the result later
    @Expose() @IsInt() @IsNotEmpty() @Min(1) twinid: number; // farmerbot twinId
    @Expose() @IsString() @IsNotEmpty() action: string; // the action in the format domain.actor.method, this example is the find node method of the farmerbot
    @Expose() @IsString() @IsOptional() args: {
        params: FarmBotParams[];
        args: FarmBotArgs[];
    }; // object encoded in a string, // the arguments that the action needs (what find node needs)
    @Expose() @IsString() @IsNotEmpty() state: string; // put to tostart, other types are init, recurring, scheduled, active, done, error
    @Expose() @IsNumber() @Min(1) start: number; // set to time.now()
    @Expose() @IsNumber() @IsOptional() @Min(1) end: number; // ignore, it will be filled in by the actor who is executing the job
    @Expose() @IsNumber() @IsOptional() @Min(1) grace_period: number; // ignore for now
    @Expose() @IsNumber() @Min(1) @Max(600) timeout: number; // time in seconds, 10 mins is maximum.
    @Expose() @IsString() @IsOptional() error: string; // in case there was an error a message will be shown here
    @Expose() @IsNumber() @Min(1) src_twinid: number; // your twin id
    @Expose() @IsString() @IsDefined() src_action: string; // the action that requested the job (leave empty in case there was none), it is used for debugging
}

class FarmerBotFindNodeModel {
    @Expose() @IsInt() @IsNotEmpty() @Min(1) farmId: number; // farmerbot twinId
    @Expose() @IsOptional() @Min(0) required_cru?: number;
    @Expose() @IsOptional() @Min(0) required_mru?: number;
    @Expose() @IsOptional() @Min(0) required_sru?: number;
    @Expose() @IsOptional() @Min(0) required_hru?: number;
    @Expose() @IsOptional() node_exclude?: Array<number>;
    @Expose() @IsOptional() @IsBoolean() dedicated?: boolean;
    @Expose() @IsOptional() @IsBoolean() public_config?: boolean;
    @Expose() @IsOptional() @Min(0) public_ips?: number;
    @Expose() @IsOptional() @IsBoolean() certified?: boolean;
}

class FarmerBot {
    rmb: RMB;
    client: TFClient;

    constructor(public config: GridClientConfig) {
        this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
        this.rmb = new RMB(config.rmbClient);
    }

    async findNode(options: FarmerBotFindNodeModel) {
        const farm = await this.client.farms.getFarmByID(options.farmId);
        const startDate = new Date();
        const myTwinID = this.config.twinId;
        const farmerBotActionJobPublicModel: FarmerBotActionJobPublicModel = {
            guid: uuid4(),
            twinid: farm.twinId,
            action: "farmerbot.nodemanager.findnode",
            args: {
                params: [
                    { key: "required_hru", value: options.required_hru?.toLocaleString() },
                    { key: "required_cru", value: options.required_cru?.toLocaleString() },
                    { key: "required_mru", value: options.required_mru?.toLocaleString() },
                    { key: "required_sru", value: options.required_sru?.toLocaleString() },
                    { key: "node_exclude", value: options.node_exclude?.toLocaleString() },
                    { key: "dedicated", value: options.dedicated?.toLocaleString() },
                    { key: "public_config", value: options.public_config?.toLocaleString() },
                    { key: "public_ips", value: options.public_ips?.toLocaleString() },
                    { key: "certified", value: options.certified?.toLocaleString() },
                ],
                args: [],
            },
            state: "init",
            start: +startDate,
            end: 1,
            grace_period: 1,
            timeout: 600,
            error: "",
            src_twinid: myTwinID,
            src_action: "",
        };

        const payload = JSON.stringify(farmerBotActionJobPublicModel, (_, v) =>
            Array.isArray(v) ? v.filter(e => e.value !== undefined) : v,
        );

        const node = await this.rmb.request([farm.twinId], "execute_job", payload);

        const result = node?.result?.params;

        if (result) {
            const nodeId = +result.filter(x => x.key === "nodeid")[0].value;
            if (nodeId) {
                return nodeId;
            } else {
                throw new Error("Couldn't find a suitable node. Please try again.");
            }
        } else {
            throw new Error(node.error);
        }
    }

    async pingFarm(options: pingFarmModel) {
        const farm = await this.client.farms.getFarmByID(options.farmId);

        const startDate = new Date();
        const myTwinID = this.config.twinId;
        const farmerBotActionJobPublicModel: FarmerBotActionJobPublicModel = {
            guid: uuid4(),
            twinid: farm.twinId,
            action: "farmerbot.farmmanager.version",
            args: {
                params: [],
                args: [],
            },
            state: "init",
            start: +startDate,
            end: 1,
            grace_period: 1,
            timeout: 600,
            error: "",
            src_twinid: myTwinID,
            src_action: "",
        };

        const payload = JSON.stringify(farmerBotActionJobPublicModel);
        const pingedFarm = await this.rmb.request([farm.twinId], "execute_job", payload, 20);

        if (pingedFarm.error) {
            throw Error(pingedFarm.error);
        } else {
            return pingedFarm;
        }
    }
}

export { FarmerBot, FarmerBotFindNodeModel, FarmerBotActionJobPublicModel };
