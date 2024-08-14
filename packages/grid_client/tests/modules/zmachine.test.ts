import { plainToClass } from "class-transformer";

import { ComputeCapacity, Mount, Zmachine, ZmachineNetwork, ZNetworkInterface } from "../../src";

let zmachine = new Zmachine();
const computeCapacity = new ComputeCapacity();
const network = new ZmachineNetwork();
const disks = new Mount();

beforeEach(() => {
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

  const rootfs_size = 2;

  disks.name = "zdisk";
  disks.mountpoint = "/mnt/data";

  zmachine.flist = "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist";
  zmachine.network = network;
  zmachine.size = rootfs_size * 1024 ** 3;
  zmachine.mounts = [disks];
  zmachine.entrypoint = "/sbin/zinit init";
  zmachine.compute_capacity = computeCapacity;
  zmachine.env = { key: "value" };
  zmachine.corex = false;
  zmachine.gpu = ["AMD", "NIVIDIA"];
});

describe("Zmachine Class Tests", () => {
  it("should create a valid Zmachine instance", () => {
    expect(zmachine).toBeInstanceOf(Zmachine);
  });

  it("should correctly serialize and deserialize a Zmachine instance", () => {
    const serialized = JSON.stringify(zmachine);
    const deserialized = plainToClass(Zmachine, JSON.parse(serialized));

    expect(deserialized).toBeInstanceOf(Zmachine);
    expect(deserialized.challenge()).toBe(zmachine.challenge());
  });
  it("should correctly handle env vars", () => {
    const challenge = zmachine.challenge();

    expect(challenge).toContain("key=value");
  });

  it("should correctly compute the challenge string", () => {
    const expectedChallenge =
      zmachine.flist +
      network.challenge() +
      zmachine.size +
      computeCapacity.challenge() +
      zmachine.mounts[0].challenge() +
      zmachine.entrypoint +
      JSON.stringify(zmachine.env)
        .replace(/[{"}"]/g, "")
        .replace(":", "=") +
      zmachine.gpu?.toString().replace(",", "");

    expect(zmachine.challenge()).toBe(expectedChallenge);
    expect(zmachine.challenge()).toContain("key=value");
  });

  it("should correctly handle the gpu array", () => {
    expect(zmachine.gpu).toContain("NIVIDIA");

    zmachine.gpu = [];

    expect(zmachine.challenge()).not.toContain("NIVIDIA");

    zmachine.gpu = ["NIVIDIA", "AMD"];

    expect(zmachine.challenge()).toContain("NIVIDIA");
    expect(zmachine.challenge()).toContain("AMD");
  });

  it("should handle network configurations", () => {
    const challenge = zmachine.challenge();

    expect(challenge).toContain("10.249.0.0/16");
    expect(challenge).toContain("znetwork");
    expect(challenge).toContain("mycelium_net");
    expect(challenge).toContain("abc123");
  });

  it("should fail validation for entering invalid data", () => {
    const invalidFlist = () => {
      zmachine.flist = "";
    };
    const invalidEntrypoint = () => (zmachine.entrypoint = undefined as any);
    const invalidSize = () => (zmachine.size = 10 * 1024 ** 5);

    expect(invalidFlist).toThrow();
    expect(invalidEntrypoint).toThrow();
    expect(invalidSize).toThrow();
  });

  it("should throw error if network public_ip is invalid", () => {
    const invalidNetwork = new ZmachineNetwork();
    invalidNetwork.public_ip = undefined as any;
    invalidNetwork.planetary = true;
    invalidNetwork.interfaces = [{ network: "znetwork", ip: "10.20.2.2" }];

    const result = () => {
      zmachine.network = invalidNetwork;
    };

    expect(result).toThrow();
  });

  it("should throw error if network interfaces values are invalid", () => {
    const invalidNetwork = new ZmachineNetwork();
    invalidNetwork.public_ip = "10.249.0.0/16";
    invalidNetwork.planetary = true;
    invalidNetwork.interfaces = [new ZNetworkInterface()];
    invalidNetwork.interfaces[0].network = "";
    invalidNetwork.interfaces[0].ip = "";

    const result = () => {
      zmachine.network = invalidNetwork;
    };

    expect(result).toThrow();
  });

  it("should throw an error if mount name is empty", () => {
    const invalidMount = new Mount();
    invalidMount.name = "";
    invalidMount.mountpoint = "/mnt/data";

    const result = () => {
      zmachine.mounts = [invalidMount];
    };

    expect(result).toThrow();
  });

  it("should fail if zmachine is parsed to an invalid object", () => {
    const invalidZmachine = `{
      "flist": "",
      "network": "invalid_network_object",
      "size": "not_a_number",
      "compute_capacity": {},
      "mounts": "not_an_array",
      "entrypoint": 123,
      "env": "not_an_object",
      "corex": "not_a_boolean",
      "gpu": [123, "valid_string", false]
    }`;

    const result = () => {
      zmachine = plainToClass(Zmachine, JSON.parse(invalidZmachine));
    };

    expect(result).toThrow();
  });
});
