import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { Deployment, SignatureRequirement, SignatureRequest, Signature, KeypairType } from "../../src/zos/deployment";
import { Workload, WorkloadTypes } from "../../src/zos/workload";
import { Zmachine, ZmachineNetwork, MyceliumIP } from "../../src/zos/zmachine";
import { ComputeCapacity } from "../../src/zos/computecapacity";
import { default as md5 } from "crypto-js/md5";
import { FLISTS } from "../../src/helpers/flists";

const TEST_CONSTANTS = {
  TWIN_ID: 123,
  CONTRACT_ID: 456,
  EXPIRATION: 1000000000,
  METADATA: "test_metadata",
  DESCRIPTION: "test_description",
  WEIGHT_REQUIRED: 10,
  WEIGHT: 5,

  WORKLOAD_NAME: "test_workload",
  WORKLOAD_METADATA: "workload_metadata",
  WORKLOAD_DESCRIPTION: "workload_description",

  CPU: 1,
  MEMORY: 1024 * 1024 * 1024, // 1GB in bytes
  SIZE: 10 * 1024 * 1024, // 10MB in bytes
  PUBLIC_IP: "10.0.0.1",
  NETWORK_NAME: "test_network",
  NETWORK_SEED: "test_seed",

  MNEMONIC: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
} as const;

const createSignatureRequest = (overrides: Partial<SignatureRequest> = {}): SignatureRequest => {
  const request = new SignatureRequest();
  request.twin_id = TEST_CONSTANTS.TWIN_ID;
  request.required = true;
  request.weight = TEST_CONSTANTS.WEIGHT;

  return Object.assign(request, overrides);
};

const createSignature = (overrides: Partial<Signature> = {}): Signature => {
  const signature = new Signature();
  signature.twin_id = TEST_CONSTANTS.TWIN_ID;
  signature.signature = "test_signature";
  signature.signature_type = KeypairType.sr25519;

  return Object.assign(signature, overrides);
};

const createSignatureRequirement = (overrides: Partial<SignatureRequirement> = {}): SignatureRequirement => {
  const requirement = new SignatureRequirement();
  requirement.weight_required = TEST_CONSTANTS.WEIGHT_REQUIRED;
  requirement.requests = [];
  requirement.signatures = [];

  return Object.assign(requirement, overrides);
};

const createZmachineData = (overrides: Partial<Zmachine> = {}): Zmachine => {
  const zmachineData = new Zmachine();
  zmachineData.flist = FLISTS.MICROVMS_UBUNTU_24.flist;
  zmachineData.entrypoint = FLISTS.MICROVMS_UBUNTU_24.entryPoint;

  const computeCapacity = new ComputeCapacity();
  computeCapacity.cpu = TEST_CONSTANTS.CPU;
  computeCapacity.memory = TEST_CONSTANTS.MEMORY;
  zmachineData.compute_capacity = computeCapacity;

  zmachineData.size = TEST_CONSTANTS.SIZE;

  const network = new ZmachineNetwork();
  network.public_ip = TEST_CONSTANTS.PUBLIC_IP;
  network.interfaces = [];
  network.planetary = false;
  network.mycelium = new MyceliumIP();
  network.mycelium.network = TEST_CONSTANTS.NETWORK_NAME;
  network.mycelium.hex_seed = TEST_CONSTANTS.NETWORK_SEED;
  zmachineData.network = network;

  zmachineData.mounts = [];
  zmachineData.env = {};
  zmachineData.corex = false;

  return Object.assign(zmachineData, overrides);
};

const createWorkload = (overrides: Partial<Workload> = {}): Workload => {
  const workload = new Workload();
  workload.version = 1;
  workload.name = TEST_CONSTANTS.WORKLOAD_NAME;
  workload.type = WorkloadTypes.zmachine;
  workload.metadata = TEST_CONSTANTS.WORKLOAD_METADATA;
  workload.description = TEST_CONSTANTS.WORKLOAD_DESCRIPTION;
  workload.data = createZmachineData();

  return Object.assign(workload, overrides);
};

const createDeployment = (overrides: Partial<Deployment> = {}): Deployment => {
  const deployment = new Deployment();
  deployment.version = 1;
  deployment.twin_id = TEST_CONSTANTS.TWIN_ID;
  deployment.contract_id = TEST_CONSTANTS.CONTRACT_ID;
  deployment.expiration = TEST_CONSTANTS.EXPIRATION;
  deployment.metadata = TEST_CONSTANTS.METADATA;
  deployment.description = TEST_CONSTANTS.DESCRIPTION;
  deployment.workloads = [createWorkload()];
  deployment.signature_requirement = createSignatureRequirement();

  return Object.assign(deployment, overrides);
};

const createValidSignatureRequestData = () => ({
  twin_id: TEST_CONSTANTS.TWIN_ID,
  required: true,
  weight: TEST_CONSTANTS.WEIGHT,
});

const createValidSignatureData = () => ({
  twin_id: TEST_CONSTANTS.TWIN_ID,
  signature: "test_signature",
  signature_type: "sr25519",
});

const createValidSignatureRequirementData = () => ({
  weight_required: TEST_CONSTANTS.WEIGHT_REQUIRED,
  requests: [createValidSignatureRequestData()],
  signatures: [createValidSignatureData()],
});

describe("SignatureRequest", () => {
  describe("constructor and properties", () => {
    it("should create a valid SignatureRequest", () => {
      const signatureRequest = createSignatureRequest();

      expect(signatureRequest.twin_id).toBe(TEST_CONSTANTS.TWIN_ID);
      expect(signatureRequest.required).toBe(true);
      expect(signatureRequest.weight).toBe(TEST_CONSTANTS.WEIGHT);
    });
  });

  describe("challenge method", () => {
    it("should generate correct challenge string", () => {
      const signatureRequest = createSignatureRequest();

      const challenge = signatureRequest.challenge();
      expect(challenge).toBe(`${TEST_CONSTANTS.TWIN_ID}true${TEST_CONSTANTS.WEIGHT}`);
    });
  });

  describe("validation", () => {
    it("should validate with valid data", async () => {
      const signatureRequest = plainToInstance(SignatureRequest, createValidSignatureRequestData());

      const errors = await validate(signatureRequest);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with invalid twin_id", async () => {
      const signatureRequest = plainToInstance(SignatureRequest, {
        ...createValidSignatureRequestData(),
        twin_id: 0,
      });

      const errors = await validate(signatureRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it("should fail validation with invalid weight", async () => {
      const signatureRequest = plainToInstance(SignatureRequest, {
        ...createValidSignatureRequestData(),
        weight: 0,
      });

      const errors = await validate(signatureRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });
  });
});

describe("Signature", () => {
  describe("constructor and properties", () => {
    it("should create a valid Signature", () => {
      const signature = createSignature();

      expect(signature.twin_id).toBe(TEST_CONSTANTS.TWIN_ID);
      expect(signature.signature).toBe("test_signature");
      expect(signature.signature_type).toBe(KeypairType.sr25519);
    });
  });

  describe("validation", () => {
    it("should validate with valid data", async () => {
      const signature = plainToInstance(Signature, createValidSignatureData());

      const errors = await validate(signature);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with invalid twin_id", async () => {
      const signature = plainToInstance(Signature, {
        ...createValidSignatureData(),
        twin_id: 0,
      });

      const errors = await validate(signature);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it("should fail validation with empty signature", async () => {
      const signature = plainToInstance(Signature, {
        ...createValidSignatureData(),
        signature: "",
      });

      const errors = await validate(signature);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it("should fail validation with invalid signature type", async () => {
      const signature = plainToInstance(Signature, {
        ...createValidSignatureData(),
        signature_type: "invalid_type",
      });

      const errors = await validate(signature);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });
  });
});

describe("SignatureRequirement", () => {
  describe("constructor and properties", () => {
    it("should create a valid SignatureRequirement", () => {
      const signatureRequirement = createSignatureRequirement();

      expect(signatureRequirement.weight_required).toBe(TEST_CONSTANTS.WEIGHT_REQUIRED);
      expect(signatureRequirement.requests).toEqual([]);
      expect(signatureRequirement.signatures).toEqual([]);
    });
  });

  describe("challenge method", () => {
    it("should generate correct challenge string with requests", () => {
      const signatureRequirement = createSignatureRequirement();
      signatureRequirement.weight_required = 15;

      const request1 = createSignatureRequest({ twin_id: 1, weight: 5 });
      const request2 = createSignatureRequest({ twin_id: 2, required: false, weight: 10 });

      signatureRequirement.requests = [request1, request2];

      const challenge = signatureRequirement.challenge();
      expect(challenge).toBe("1true52false1015");
    });

    it("should generate correct challenge string with no requests", () => {
      const signatureRequirement = createSignatureRequirement();

      const challenge = signatureRequirement.challenge();
      expect(challenge).toBe(TEST_CONSTANTS.WEIGHT_REQUIRED.toString());
    });
  });

  describe("validation", () => {
    it("should validate with valid data", async () => {
      const signatureRequirement = plainToInstance(SignatureRequirement, createValidSignatureRequirementData());

      const errors = await validate(signatureRequirement);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with invalid weight_required", async () => {
      const signatureRequirement = plainToInstance(SignatureRequirement, {
        ...createValidSignatureRequirementData(),
        weight_required: 0,
      });

      const errors = await validate(signatureRequirement);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });
  });
});

describe("Deployment", () => {
  describe("constructor and properties", () => {
    it("should create a valid Deployment", () => {
      const deployment = createDeployment();

      expect(deployment.version).toBe(1);
      expect(deployment.twin_id).toBe(TEST_CONSTANTS.TWIN_ID);
      expect(deployment.contract_id).toBe(TEST_CONSTANTS.CONTRACT_ID);
      expect(deployment.expiration).toBe(TEST_CONSTANTS.EXPIRATION);
      expect(deployment.metadata).toBe(TEST_CONSTANTS.METADATA);
      expect(deployment.description).toBe(TEST_CONSTANTS.DESCRIPTION);
      expect(deployment.workloads).toHaveLength(1);
      expect(deployment.signature_requirement).toBeInstanceOf(SignatureRequirement);
    });
  });

  describe("challenge method", () => {
    it("should generate correct challenge string", () => {
      const deployment = createDeployment({ version: 2 });

      const challenge = deployment.challenge();

      // Calculate expected challenge string based on test data
      const expectedChallenge =
        "2" +
        TEST_CONSTANTS.TWIN_ID +
        TEST_CONSTANTS.METADATA +
        TEST_CONSTANTS.DESCRIPTION +
        TEST_CONSTANTS.EXPIRATION +
        "1" +
        TEST_CONSTANTS.WORKLOAD_NAME +
        "zmachine" +
        TEST_CONSTANTS.WORKLOAD_METADATA +
        TEST_CONSTANTS.WORKLOAD_DESCRIPTION +
        FLISTS.MICROVMS_UBUNTU_24.flist +
        TEST_CONSTANTS.PUBLIC_IP +
        "false" +
        "" +
        "" +
        TEST_CONSTANTS.NETWORK_NAME +
        TEST_CONSTANTS.NETWORK_SEED +
        TEST_CONSTANTS.SIZE +
        TEST_CONSTANTS.CPU +
        TEST_CONSTANTS.MEMORY +
        "" +
        FLISTS.MICROVMS_UBUNTU_24.entryPoint +
        "" +
        "" +
        TEST_CONSTANTS.WEIGHT_REQUIRED;

      expect(challenge).toBe(expectedChallenge);
    });

    it("should generate correct challenge string with multiple workloads", () => {
      const deployment = createDeployment();
      const secondWorkload = createWorkload({ name: "second_workload" });
      deployment.workloads.push(secondWorkload);

      const challenge = deployment.challenge();
      expect(challenge).toContain("test_workload");
      expect(challenge).toContain("second_workload");
      expect(challenge).toContain(TEST_CONSTANTS.WEIGHT_REQUIRED.toString());
    });
  });

  describe("challenge_hash method", () => {
    it("should generate correct challenge hash", () => {
      const deployment = createDeployment();

      const challenge = deployment.challenge();
      const expectedHash = md5(challenge).toString();
      const actualHash = deployment.challenge_hash();

      expect(actualHash).toBe(expectedHash);
    });
  });

  describe("hex conversion methods", () => {
    it("should convert hex string to Uint8Array", () => {
      const deployment = createDeployment();
      const hexString = "48656c6c6f";
      const result = deployment.from_hex(hexString);

      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it("should convert Uint8Array to hex string", () => {
      const deployment = createDeployment();
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = deployment.to_hex(bytes);

      expect(result).toBe("48656c6c6f");
    });

    it("should handle empty hex string", () => {
      const deployment = createDeployment();
      const result = deployment.from_hex("");
      expect(result).toEqual(new Uint8Array(0));
    });

    it("should handle empty Uint8Array", () => {
      const deployment = createDeployment();
      const result = deployment.to_hex(new Uint8Array(0));
      expect(result).toBe("");
    });
  });

  describe("validation", () => {
    it("should validate with valid data", async () => {
      const deployment = createDeployment();

      const errors = await validate(deployment);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with invalid version", async () => {
      const deployment = createDeployment({ version: -1 });

      const errors = await validate(deployment);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it("should fail validation with invalid twin_id", async () => {
      const deployment = createDeployment({ twin_id: 0 });

      const errors = await validate(deployment);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });
  });
});

describe("Deployment signing", () => {
  let deployment: Deployment;

  beforeEach(() => {
    deployment = createDeployment();
  });

  describe("basic signing", () => {
    it("should sign deployment with sr25519", async () => {
      await deployment.sign(TEST_CONSTANTS.TWIN_ID, TEST_CONSTANTS.MNEMONIC, KeypairType.sr25519);

      expect(deployment.signature_requirement.signatures).toHaveLength(1);
      expect(deployment.signature_requirement.signatures[0].twin_id).toBe(TEST_CONSTANTS.TWIN_ID);
      expect(deployment.signature_requirement.signatures[0].signature_type).toBe(KeypairType.sr25519);
      expect(deployment.signature_requirement.signatures[0].signature).toBeDefined();
      expect(deployment.signature_requirement.signatures[0].signature.length).toBeGreaterThan(0);
    });

    it("should sign deployment with ed25519", async () => {
      await deployment.sign(TEST_CONSTANTS.TWIN_ID, TEST_CONSTANTS.MNEMONIC, KeypairType.ed25519);

      expect(deployment.signature_requirement.signatures).toHaveLength(1);
      expect(deployment.signature_requirement.signatures[0].twin_id).toBe(TEST_CONSTANTS.TWIN_ID);
      expect(deployment.signature_requirement.signatures[0].signature_type).toBe(KeypairType.ed25519);
      expect(deployment.signature_requirement.signatures[0].signature).toBeDefined();
      expect(deployment.signature_requirement.signatures[0].signature.length).toBeGreaterThan(0);
    });

    it("should sign deployment with custom hash", async () => {
      const customHash = "custom_hash_string";
      await deployment.sign(TEST_CONSTANTS.TWIN_ID, TEST_CONSTANTS.MNEMONIC, KeypairType.sr25519, customHash);

      expect(deployment.signature_requirement.signatures).toHaveLength(1);
      expect(deployment.signature_requirement.signatures[0].twin_id).toBe(TEST_CONSTANTS.TWIN_ID);
      expect(deployment.signature_requirement.signatures[0].signature).toBeDefined();
    });
  });

  describe("signature management", () => {
    it("should add new signature for different twin_id", async () => {
      // Add initial signature for twin_id 123
      const initialSignature = createSignature({ signature: "signature_123" });
      deployment.signature_requirement.signatures.push(initialSignature);

      // Sign for different twin_id
      const differentTwinId = 456;
      await deployment.sign(differentTwinId, TEST_CONSTANTS.MNEMONIC, KeypairType.ed25519);

      expect(deployment.signature_requirement.signatures).toHaveLength(2);

      const signature123 = deployment.signature_requirement.signatures.find(s => s.twin_id === TEST_CONSTANTS.TWIN_ID);
      const signature456 = deployment.signature_requirement.signatures.find(s => s.twin_id === differentTwinId);

      expect(signature123).toBeDefined();
      expect(signature123?.signature).toBe("signature_123");
      expect(signature456).toBeDefined();
      expect(signature456?.signature_type).toBe(KeypairType.ed25519);
    });

    it("should handle multiple signatures for different twin_ids", async () => {
      const twinId1 = 123;
      const twinId2 = 456;
      const twinId3 = 789;

      await deployment.sign(twinId1, TEST_CONSTANTS.MNEMONIC, KeypairType.sr25519);
      await deployment.sign(twinId2, TEST_CONSTANTS.MNEMONIC, KeypairType.ed25519);
      await deployment.sign(twinId3, TEST_CONSTANTS.MNEMONIC, KeypairType.sr25519);

      expect(deployment.signature_requirement.signatures).toHaveLength(3);

      const signatures = deployment.signature_requirement.signatures;
      expect(signatures.find(s => s.twin_id === twinId1)).toBeDefined();
      expect(signatures.find(s => s.twin_id === twinId2)).toBeDefined();
      expect(signatures.find(s => s.twin_id === twinId3)).toBeDefined();
    });
  });
});

describe("KeypairType enum", () => {
  it("should have correct enum values", () => {
    expect(KeypairType.sr25519).toBe("sr25519");
    expect(KeypairType.ed25519).toBe("ed25519");
  });

  it("should allow assignment of enum values", () => {
    const signature = new Signature();
    signature.signature_type = KeypairType.sr25519;
    expect(signature.signature_type).toBe(KeypairType.sr25519);

    signature.signature_type = KeypairType.ed25519;
    expect(signature.signature_type).toBe(KeypairType.ed25519);
  });
});
