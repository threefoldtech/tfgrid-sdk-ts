import { SSHKeyData } from "@/types";

import SSHKeysManagement from "./ssh";

describe("SSHKeysManagement", () => {
  let sshManager: SSHKeysManagement;

  beforeEach(() => {
    // Mock useProfileManager to avoid store dependency
    jest.resetModules();
    jest.mock("@/stores/profile_manager", () => ({
      useProfileManager: () => ({
        profile: { ssh: "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEArandomkey== user@host" },
        updateSSH: jest.fn(),
      }),
    }));
    sshManager = new (require("./ssh").default)();
  });

  describe("assignDefaultNames", () => {
    it("assigns default names to keys without names", () => {
      const keys: SSHKeyData[] = [
        { id: 1, publicKey: "key1", name: "", createdAt: "2024-01-01", isActive: true },
        { id: 2, publicKey: "key2", name: undefined as any, createdAt: "2024-01-01", isActive: true },
        { id: 3, publicKey: "key3", name: "custom", createdAt: "2024-01-01", isActive: true },
        { id: 4, publicKey: "key4", name: "default", createdAt: "2024-01-01", isActive: true },
      ];
      const result = sshManager.assignDefaultNames(keys);
      const names = result.map(k => k.name);
      expect(names).toContain("default1");
      expect(names).toContain("default2");
      expect(names).toContain("default");
      expect(names).toContain("custom");
      // All names should be non-empty
      expect(names.every(Boolean)).toBe(true);
    });
  });

  describe("needsDefaultNameAssignment", () => {
    it("returns true if any key is missing a name", () => {
      const keys: SSHKeyData[] = [
        { id: 1, publicKey: "key1", name: "", createdAt: "2024-01-01", isActive: true },
        { id: 2, publicKey: "key2", name: "foo", createdAt: "2024-01-01", isActive: true },
      ];
      expect(sshManager.needsDefaultNameAssignment(keys)).toBe(true);
    });
    it("returns false if all keys have names", () => {
      const keys: SSHKeyData[] = [
        { id: 1, publicKey: "key1", name: "foo", createdAt: "2024-01-01", isActive: true },
        { id: 2, publicKey: "key2", name: "bar", createdAt: "2024-01-01", isActive: true },
      ];
      expect(sshManager.needsDefaultNameAssignment(keys)).toBe(false);
    });
  });
});
