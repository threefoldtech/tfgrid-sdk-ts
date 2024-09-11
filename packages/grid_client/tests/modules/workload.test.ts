import { plainToClass } from "class-transformer";

import { DeploymentResult, ResultStates, Workload, WorkloadTypes } from "../../src";
import {
  ComputeCapacity,
  GatewayFQDNProxy,
  GatewayNameProxy,
  Mount,
  PublicIP,
  QuantumSafeFS,
  Volume,
  Zdb,
  Zlogs,
  Zmachine,
  ZmachineNetwork,
  Zmount,
  Znet,
} from "../../src";

let workload: Workload;

// Creates instances of workload data types and set their data
const createDataInstance = (type: WorkloadTypes) => {
  let instance;
  const network = new ZmachineNetwork();
  const computeCapacity = new ComputeCapacity();
  const disks = new Mount();

  const rootfs_size = 2;

  switch (type) {
    case WorkloadTypes.zmachine:
      instance = new Zmachine();
      computeCapacity.cpu = 1;
      computeCapacity.memory = 256 * 1024 ** 2;

      network.planetary = true;
      network.public_ip = "10.249.0.0/16";
      network.interfaces = [
        {
          network: "znetwork",
          ip: "10.20.2.2",
        },
      ];
      network.mycelium = {
        network: "mycelium_net",
        hex_seed: "abc123",
      };

      disks.name = "zdisk";
      disks.mountpoint = "/mnt/data";

      instance.flist = "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist";
      instance.network = network;
      instance.size = rootfs_size * 1024 ** 3;
      instance.mounts = [disks];
      instance.entrypoint = "/sbin/zinit init";
      instance.compute_capacity = computeCapacity;
      instance.env = { key: "value" };
      instance.corex = false;
      instance.gpu = ["AMD", "NIVIDIA"];

      break;
    case WorkloadTypes.zmount:
      instance = new Zmount();
      // Initialize zmount variables
      break;
    case WorkloadTypes.volume:
      instance = new Volume();
      // Initialize volume variables
      break;
    case WorkloadTypes.network:
      instance = new Znet();
      // Initialize znet variables
      break;
    case WorkloadTypes.zdb:
      instance = new Zdb();
      // Initialize zdb variables
      break;
    case WorkloadTypes.ip:
      instance = new PublicIP();
      // Initialize publicIP variables
      break;
    case WorkloadTypes.qsfs:
      instance = new QuantumSafeFS();
      // Initialize qsfs variables
      break;
    case WorkloadTypes.zlogs:
      instance = new Zlogs();
      // Initialize zlogs variables
      break;
    case WorkloadTypes.gatewayfqdnproxy:
      instance = new GatewayFQDNProxy();
      // Initialize gatewayFQDNProxy variables
      break;
    case WorkloadTypes.gatewaynameproxy:
      instance = new GatewayNameProxy();
      // Initialize gatewayNameProxy variables
      break;
    default:
      throw new Error(`Invalid WorkloadType: ${type}`);
  }

  return instance;
};

// Initialize workload before each test
beforeEach(() => {
  const dataInstance = createDataInstance(WorkloadTypes.zmachine); //The type you want to test can be changed
  workload = new Workload();
  workload.version = 1;
  workload.name = "Test Workload";
  workload.type = WorkloadTypes.zmachine; // Should reflect created data instance
  workload.metadata = "Metadata";
  workload.description = "A test for workload";
  workload.data = dataInstance;
  workload.result = new DeploymentResult();
  workload.result.created = Date.now();
  workload.result.state = ResultStates.ok;
  workload.result.message = "Deployment successful";
  workload.result.data = workload.data;
});

describe("Workload Class Tests", () => {
  test("should create a valid Workload instance", () => {
    expect(workload).toBeInstanceOf(Workload);
  });

  test("should handle valid Workload properties", () => {
    expect(workload.version).toBe(1);
    expect(workload.name).toBe("Test Workload");
    expect(workload.type).toBe(WorkloadTypes.zmachine);
    expect(workload.metadata).toBe("Metadata");
    expect(workload.description).toBe("A test for workload");
    expect(workload.data).toBeInstanceOf(Zmachine); // Should reflect the workload type
    expect(workload.result.created).toBeGreaterThan(0);
    expect(workload.result.state).toBe(ResultStates.ok);
    expect(workload.result.message).toBe("Deployment successful");
  });

  test("should correctly serialize and deserialize Workload", () => {
    const serialized = JSON.stringify(workload);
    const deserialized = plainToClass(Workload, JSON.parse(serialized));

    // Change the deserialized data variable into an instance of the correct workload type
    if (deserialized.data) {
      deserialized.data = plainToClass(Zmachine, deserialized.data); // Should reflect the workload type
    }

    expect(deserialized).toBeInstanceOf(Workload);
    expect(deserialized.challenge()).toBe(workload.challenge());
  });

  test("should correctly compute the challenge string", () => {
    const expectedChallenge =
      workload.version.toString() +
      workload.name +
      workload.type.toString() +
      workload.metadata +
      workload.description +
      workload.data.challenge();

    expect(workload.challenge()).toBe(expectedChallenge);
  });

  test("should handle invalid Workload type", () => {
    const invalidWorkload = new Workload();
    invalidWorkload.version = 1;
    invalidWorkload.name = "Invalid Workload";
    invalidWorkload.type = WorkloadTypes.zmachine; // Invalid workload type
    invalidWorkload.metadata = "Metadata";
    invalidWorkload.description = "A test for workload";
    invalidWorkload.data = createDataInstance(WorkloadTypes.zmachine);
    invalidWorkload.result = new DeploymentResult();
    invalidWorkload.result.created = Date.now();
    invalidWorkload.result.state = ResultStates.ok;
    invalidWorkload.result.message = "Deployment successful";
    invalidWorkload.result.data = invalidWorkload.data;

    expect(() => invalidWorkload.challenge()).not.toThrow();
  });

  test("should handle invalid DeploymentResult", () => {
    const invalidResult = new DeploymentResult();
    invalidResult.created = Date.now();
    invalidResult.state = "invalid-state" as any; // Invalid state
    invalidResult.message = "Deployment successful";
    invalidResult.data = workload.data;

    workload.result = invalidResult;

    expect(() => workload.challenge()).not.toThrow();
  });
});
