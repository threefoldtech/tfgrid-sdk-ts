import { ComputeCapacity, Mount, Zmachine, ZmachineNetwork } from "../../src";

const zmachine = new Zmachine();
const computeCapacity = new ComputeCapacity();
const network = new ZmachineNetwork();
const disks = new Mount();

beforeAll(() => {
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

  const rootfs_size = 2;

  disks.name = "zdisk";
  disks.mountpoint = "/mnt/data";

  zmachine.flist = "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist";
  zmachine.network = network;
  zmachine.size = rootfs_size * 1024 ** 3;
  zmachine.mounts = [disks];
  zmachine.entrypoint = "/sbin/zinit init";
  zmachine.compute_capacity = computeCapacity;
  zmachine.env = {};
  zmachine.corex = false;
  zmachine.gpu = [];
});

describe("Zmachine Class Tests", () => {
  it("should create a valid Zmachine instance", () => {
    expect(zmachine).toBeInstanceOf(Zmachine);
  });

  it("should correctly compute the challenge string", () => {
    const expectedChallenge =
      zmachine.flist +
      network.challenge() +
      zmachine.size +
      computeCapacity.challenge() +
      zmachine.mounts[0].challenge() +
      zmachine.entrypoint;

    expect(zmachine.challenge()).toBe(expectedChallenge);
  });

  it("should fail validation for missing required fields", () => {
    const result = () => {
      zmachine.flist = "";
      zmachine.entrypoint = "";
    };
    expect(result).toThrow();
  });
});
