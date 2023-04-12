import { RMB } from "../clients/rmb/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { Operations, TwinDeployment } from "../high_level/models";
import { TwinDeploymentHandler } from "../high_level/twinDeploymentHandler";
import { DeploymentFactory } from "../primitives/deployment";
import { Nodes } from "../primitives/nodes";
import { WorkloadTypes } from "../zos/workload";
import { PingNodeOptionsModel, ZOSGetDeploymentModel, ZOSModel, ZOSNodeModel } from "./models";
import { checkBalance } from "./utils";

class Zos {
    rmb: RMB;
    capacity: Nodes;
    constructor(public config: GridClientConfig) {
        this.rmb = new RMB(config.rmbClient);
        this.capacity = new Nodes(this.config.graphqlURL, this.config.proxyURL, this.config.rmbClient);
    }

    @expose
    @validateInput
    @checkBalance
    async deploy(options: ZOSModel) {
        // get node_id from the deployment
        const node_id = options.node_id;
        delete options.node_id;

        const deploymentFactory = new DeploymentFactory(this.config);
        const deployment = await deploymentFactory.fromObj(options);

        let publicIps = 0;
        for (const workload of deployment.workloads) {
            if (workload.type === WorkloadTypes.ip && workload.data["v4"]) {
                publicIps++;
            }
        }
        console.log(`Deploying on node_id: ${node_id} with number of public IPs: ${publicIps}`);
        const twinDeployment = new TwinDeployment(deployment, Operations.deploy, publicIps, node_id);
        const twinDeploymentHandler = new TwinDeploymentHandler(this.config);
        return await twinDeploymentHandler.handle([twinDeployment]);
    }

    @expose
    @validateInput
    async pingNode(options: PingNodeOptionsModel): Promise<boolean> {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.system.version", "", 20, 1);
    }

    @expose
    @validateInput
    async getDeployment(options: ZOSGetDeploymentModel) {
        const nodeId = await this.capacity.getNodeIdFromContractId(options.contractId, this.config.mnemonic);
        const nodeTwinId = await this.capacity.getNodeTwinId(nodeId);
        const payload = JSON.stringify({ contract_id: options.contractId });
        return await this.rmb.request([nodeTwinId], "zos.deployment.get", payload);
    }

    @expose
    @validateInput
    async getNodeStatistics(options: ZOSNodeModel) {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.statistics.get", "");
    }

    @expose
    @validateInput
    async hasPublicIPv6(options: ZOSNodeModel) {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.network.has_ipv6", "");
    }

    @expose
    @validateInput
    async listNetworkInterfaces(options: ZOSNodeModel) {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.network.interfaces", "");
    }

    @expose
    @validateInput
    async listNetworkPublicIPs(options: ZOSNodeModel) {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.network.list_public_ips", "");
    }

    @expose
    @validateInput
    async getNetworkPublicConfig(options: ZOSNodeModel) {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.network.public_config_get", "");
    }

    @expose
    @validateInput
    async getStoragePools(options: ZOSNodeModel) {
        const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
        return await this.rmb.request([nodeTwinId], "zos.storage.pools", "");
    }
}

export { Zos as zos };
