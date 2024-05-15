import type { Contract, ExtrinsicResult } from "@threefold/tfchain_client";

import { BaseModule } from "../../../grid_client/dist/es6/modules/base";

async function _migrateOldFullVMs(module: BaseModule) {
  module.moduleName = "Fullvm"; // Load old deployments that deployed with `Fullvm` type.
  const deploymentNames = await module._list();
  const contracts = await Promise.all(
    deploymentNames.map(deploymentName => module.getDeploymentContracts(deploymentName)),
  );

  const extrinsics: ExtrinsicResult<Contract>[] = [];

  const loadUpdateExtrinsics = async () => {
    return await Promise.all(
      contracts.flat().map(async contract => {
        const oldData = JSON.parse(contract.deploymentData || "{}") as unknown as {
          type: string;
          name: string;
          projectName: string;
        };

        if (oldData.type === "vm") {
          return;
        }

        oldData.type = "vm";

        const extrinsic = await module.tfClient.contracts.updateNode({
          id: +contract.contractID,
          data: JSON.stringify(oldData),
          hash: contract.deploymentHash,
        });

        extrinsics.push(extrinsic);
        BaseModule.newContracts.push(contract);
      }),
    );
  };

  if (deploymentNames.length) {
    await loadUpdateExtrinsics();
    return await module.tfClient.applyAllExtrinsics<Contract>(extrinsics);
  }
}

export async function migrateModule(module: BaseModule) {
  await _migrateOldFullVMs(module);
  module.moduleName = "vm";
  await module._list(); // force grid_client migration

  const path = module.getNewDeploymentPath();
  const keys = await module.backendStorage.list(path);

  function __loadValue(key: string) {
    return module.backendStorage.load(module.getNewDeploymentPath(key, "contracts.json")).catch(error => {
      console.log(`error while getting value of key(${key})`, error.message || error);
      return null;
    });
  }

  const values = await Promise.all(keys.map(__loadValue));

  await _migrateContracts(module, values);
  await _migrateKeys(module, keys, values);
}

async function _migrateContracts(module: BaseModule, values: any[]) {
  function __loadContract(value: null | [{ contract_id: number }]) {
    if (!value) {
      return Promise.resolve(null);
    }
    return module.tfClient.contracts.get({ id: value[0].contract_id });
  }

  function __updateContract(contract: null | Contract, index: number) {
    const gracePeriod = contract?.state?.gracePeriod || 0;
    if (!contract || gracePeriod > 0) {
      values[index] = null;
      return [];
    }

    const nodeContract = contract?.contractType?.nodeContract;
    if (!nodeContract) {
      return [];
    }

    const { deploymentData, deploymentHash: hash } = nodeContract;
    const oldData = JSON.parse(deploymentData || "{}") as unknown as {
      type: string;
      name: string;
      projectName: string;
    };
    const { name, projectName } = oldData;
    let instanceName = name;
    if (module.moduleName === "gateways") {
      const [, instance] = name.split(module.config.twinId.toString());
      if (instance) {
        instanceName = instance;
      }
    }
    if (projectName?.endsWith(`/${instanceName}`)) {
      return [];
    }

    oldData.projectName = projectName ? `${projectName}/${instanceName}` : instanceName;
    return module.tfClient.contracts.updateNode({
      id: contract.contractId,
      data: JSON.stringify(oldData),
      hash,
    });
  }

  const contracts = await Promise.all(values.map(__loadContract));
  const updateContractsExts = await Promise.all(contracts.map(__updateContract).flat(1));
  await module.tfClient.applyAllExtrinsics(updateContractsExts.flat(1).filter(Boolean));
}

async function _migrateKeys(module: BaseModule, keys: string[], values: any[]) {
  function __normalizeKey(key: string): string {
    if (module.moduleName === "gateways") {
      const [, newKey] = key.split(module.config.twinId.toString());
      if (newKey) {
        return newKey;
      }
    }
    return key;
  }

  function __updateKey(key: string, index: number) {
    const normalizedKey = __normalizeKey(key); // will be different in gateways moduleName
    const value = values[index];
    const from = module.getNewDeploymentPath(key, "contracts.json");
    const to = module.getNewDeploymentPath(normalizedKey, key, "contracts.json");

    if (!value || from === to) {
      return [];
    }

    return [module.backendStorage.dump(to, value), module.backendStorage.remove(from)];
  }

  const exts = await Promise.all(keys.map(__updateKey).flat(1));
  await module.tfClient.applyAllExtrinsics(exts.flat(1).filter(Boolean));
}
