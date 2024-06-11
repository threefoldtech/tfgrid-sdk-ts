import { Client } from "@threefold/rmb_direct_client";

import { log, TFClient } from "../src";
import {
  ComputeCapacity,
  Deployment,
  KeypairType,
  Mount,
  SignatureRequest,
  SignatureRequirement,
  Workload,
  WorkloadTypes,
  Zmachine,
  ZmachineNetwork,
  Zmount,
  Znet,
} from "../src/zos";

const tfChainUrl = "wss://tfchain.dev.grid.tf/ws";
const mnemonic = "chicken forest enable make cute blur wait sustain armor silk carpet pet";
const relayUrl = "wss://relay.dev.grid.tf";

const zmount = new Zmount();
zmount.size = 53687091200;

const znet = new Znet();
znet.subnet = "10.20.2.0/24";
znet.ip_range = "10.20.0.0/16";
znet.peers = [];
znet.wireguard_listen_port = 18965;
znet.wireguard_private_key = "fstP8O1ndccfungAShmfpldUnQBW6UGWbuW6Iot3J1I=";

const vmNetwork = new ZmachineNetwork();
vmNetwork.interfaces = [
  {
    network: "myNetwork",
    ip: "10.20.2.2",
  },
];
vmNetwork.planetary = true;
vmNetwork.public_ip = "";

const diskMount = new Mount();
diskMount.name = "myDisk";
diskMount.mountpoint = "/mnt/data";

const computeCapacity = new ComputeCapacity();
computeCapacity.memory = 2147483648;
computeCapacity.cpu = 1;

const zmachine = new Zmachine();
zmachine.size = 26843545600;
zmachine.network = vmNetwork;
zmachine.mounts = [diskMount];
zmachine.flist = "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist";
zmachine.gpu = [];
zmachine.env = {
  SSH_KEY:
    "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDYSkliQeNK5gjMu0JpNYKvOYWImfzyPVDbT6Li4Tj8Q+PRnSgEszvJUU0UhQcb8vFv9wJthU8rDPEsolQ877FaPw0CPiN9K2L/gYdmdBJNLHaeOkZVqvWAUgzxwilzPGPh0M4yrQ3Y/YuGGsgBONrIkpioSKIzJqyeZXUl7C/FUuN8GO1PrBlGGUlA6RL3Ic0xfTTCPGkqrvIXzyfTJ+SNA2DiLtfbV55eL66EgtBwSnppM/8ZUbHq0+CBd1M+PrhdHd8vK0hmeqnVgt3Q0Bckfww8FQj+4b6CkXb+m3kPYMufIcLphgdUFMX3hucwAAxHAxOiw4Fhzlz34xeR/DuT",
};
zmachine.entrypoint = "/sbin/zinit init";
zmachine.corex = false;
zmachine.compute_capacity = computeCapacity;

// Workloads
const disk = new Workload();
disk.version = 0;
disk.data = zmount;
disk.description = "";
disk.metadata = "";
disk.name = "myDisk";
disk.type = WorkloadTypes.zmount;

const network = new Workload();
network.data = znet;
network.description = "";
network.metadata = "";
network.name = "myNetwork";
network.type = WorkloadTypes.network;
network.version = 0;

const vm = new Workload();
vm.data = zmachine;
vm.description = "";
vm.metadata = "";
vm.name = "myMachine";
vm.type = WorkloadTypes.zmachine;
vm.version = 0;

const signature_request = new SignatureRequest();
signature_request.required = false;
signature_request.twin_id = 1837;
signature_request.weight = 1;

const signature_requirement = new SignatureRequirement();
signature_requirement.requests = [signature_request];
signature_requirement.weight_required = 1;

const deployment = new Deployment();
deployment.description = "";
deployment.metadata = "";
deployment.twin_id = 1837;
deployment.version = 0;
deployment.expiration = 0;
deployment.workloads = [disk, network, vm];
deployment.signature_requirement = signature_requirement;

async function deploy() {
  const hash = deployment.challenge_hash();
  const tfClient = new TFClient(tfChainUrl, mnemonic, mnemonic, KeypairType.sr25519);
  await tfClient.connect();

  const contract = await (
    await tfClient.contracts.createNode({
      nodeId: 155,
      hash,
      data: JSON.stringify({
        version: 3,
        type: "vm",
        name: "myvm",
        projectName: "vm/myvm",
      }),
      numberOfPublicIps: 0,
      solutionProviderId: 1,
    })
  ).apply();
  deployment.contract_id = contract.contractId;
  deployment.sign(1837, mnemonic, KeypairType.sr25519);

  const rmbClient = new Client(tfChainUrl, relayUrl, mnemonic, "test", KeypairType.sr25519, 3);
  await rmbClient.connect();

  const deployMessage = await rmbClient.send("zos.deployment.deploy", JSON.stringify(deployment), 6016, 1, 3);
  const deployReply = await rmbClient.read(deployMessage);
  log(deployReply);

  await setTimeout(() => {}, 10000);

  const getMessage = await rmbClient.send(
    "zos.deployment.get",
    JSON.stringify({ contract_id: contract.contractId }),
    6016,
    1,
    3,
  );
  const getReply = await rmbClient.read(getMessage);
  log(getReply);

  await tfClient.disconnect();
  await rmbClient.disconnect();
}
deploy();
