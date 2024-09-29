import { plainToClass } from "class-transformer";

import { DeploymentResult, ResultStates, Workload, WorkloadTypes, ZdbModes } from "../../src";
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
  const size = 100 * 1025 ** 2;
  // const qsfsZdbName = "exampleZDBName";
  // const qsfsCount = 5;
  // const qsfsNodes = [];
  // const qsfsPassword = "examplePassword123";
  // const qsfsDiskSize = 10;
  // const cpu = 2;
  // const memory = 2048;
  // const rootfsSize = 4;
  // const networkName = "exampleNetwork";
  // const vmName = "exampleVM";
  // const disksQsfs = [];
  // const publicIP = false;
  // const ipRangeClassA = "10.1.0.0/16";
  // const ipRangeClassB = "172.16.0.0/16";
  // const ipRangeClassC = "192.168.0.0/16";
  // const ipRange = ipRangeClassA;
  // const metadata = "{'deploymentType': 'vm'}";
  // const description = "test deploying VM via ts grid3 client";
  // const qsfsName = "exampleQSFS";
  // const qsfsEncryptionKey = "encryptionKey123";
  // const qsfsPrefix = "prefix";
  // const qsfsCache = 2;
  // const qsfsMountPoint = "/exampleMountPoint";
  // const envVarValue = "envVarValue";

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
      instance.size = size;

      break;
    case WorkloadTypes.volume:
      instance = new Volume();
      instance.size = size;
      break;

    case WorkloadTypes.zdb:
      instance = new Zdb();
      instance.size = size;
      instance.mode = ZdbModes.user;
      instance.password = "123456";
      instance.public = false;
      break;

    case WorkloadTypes.ip:
      instance = new PublicIP();
      instance.v4 = true;
      instance.v6 = false;

      break;
    case WorkloadTypes.qsfs:
      instance = new QuantumSafeFS();

      // Initialize qsfs variables
      break;
    case WorkloadTypes.zlogs:
      instance = new Zlogs();
      instance.zmachine = "zmachine";
      instance.output = "zlog";
      break;
    case WorkloadTypes.gatewayfqdnproxy:
      instance = new GatewayFQDNProxy();
      instance.fqdn = "dmftv9qfff.gent02.dev.grid.tf";
      instance.tls_passthrough = false;
      instance.backends = ["http://185.206.122.43:80"];

      break;
    case WorkloadTypes.gatewaynameproxy:
      instance = new GatewayNameProxy();
      instance.name = "GatewayNameProxy";
      instance.tls_passthrough = false;
      instance.backends = ["http://185.206.122.43:80"];

      break;
    default:
      throw new Error(`Invalid WorkloadType: ${type}`);
  }

  return instance;
};

// Test for each WorkloadType
describe.each(Object.values(WorkloadTypes))("Workload Tests for %s", type => {
  beforeEach(() => {
    const dataInstance = createDataInstance(type);
    workload = new Workload();
    workload.version = 1;
    workload.name = "Test Workload";
    workload.type = type;
    workload.metadata = "Metadata";
    workload.description = "A test for workload";
    workload.data = dataInstance;
    workload.result = new DeploymentResult();
    workload.result.created = Date.now();
    workload.result.state = ResultStates.ok;
    workload.result.message = "Deployment successful";
    workload.result.data = workload.data;
  });

  test("should create a valid Workload instance", () => {
    expect(workload).toBeInstanceOf(Workload);
  });

  test("should handle valid Workload properties", () => {
    expect(workload.version).toBe(1);
    expect(workload.name).toBe("Test Workload");
    expect(workload.type).toBe(type);
    expect(workload.metadata).toBe("Metadata");
    expect(workload.description).toBe("A test for workload");
    expect(workload.result.created).toBeGreaterThan(0);
    expect(workload.result.state).toBe(ResultStates.ok);
    expect(workload.result.message).toBe("Deployment successful");

    switch (type) {
      case WorkloadTypes.zmachine:
        expect(workload.data).toBeInstanceOf(Zmachine);
        break;
      case WorkloadTypes.zmount:
        expect(workload.data).toBeInstanceOf(Zmount);
        break;
      case WorkloadTypes.volume:
        expect(workload.data).toBeInstanceOf(Volume);
        break;
      case WorkloadTypes.network:
        expect(workload.data).toBeInstanceOf(Znet);
        break;
      case WorkloadTypes.zdb:
        expect(workload.data).toBeInstanceOf(Zdb);
        break;
      case WorkloadTypes.ip:
        expect(workload.data).toBeInstanceOf(PublicIP);
        break;
      case WorkloadTypes.qsfs:
        expect(workload.data).toBeInstanceOf(QuantumSafeFS);
        break;
      case WorkloadTypes.zlogs:
        expect(workload.data).toBeInstanceOf(Zlogs);
        break;
      case WorkloadTypes.gatewayfqdnproxy:
        expect(workload.data).toBeInstanceOf(GatewayFQDNProxy);
        break;
      case WorkloadTypes.gatewaynameproxy:
        expect(workload.data).toBeInstanceOf(GatewayNameProxy);
        break;
      default:
        throw new Error("Unhandled WorkloadType");
    }
  });

  test("should correctly serialize and deserialize Workload", () => {
    const serialized = JSON.stringify(workload);
    const deserialized = plainToClass(Workload, JSON.parse(serialized));

    if (deserialized.data) {
      deserialized.data = plainToClass(createDataInstance(type).constructor, deserialized.data);
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

  test("should handle invalid DeploymentResult", () => {
    const invalidResult = new DeploymentResult();
    invalidResult.created = Date.now();
    invalidResult.state = "invalid-state" as any;
    invalidResult.message = "Deployment successful";
    invalidResult.data = workload.data;

    workload.result = invalidResult;

    expect(() => workload.challenge()).not.toThrow();
  });
});
