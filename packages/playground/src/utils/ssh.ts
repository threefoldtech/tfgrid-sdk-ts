import crypto from "crypto";

import { useProfileManager } from "@/stores/profile_manager";
import type { SSHKeyData } from "@/types";

import { createCustomToast, ToastType } from "./custom_toast";
import { getGrid, storeSSH } from "./grid";
import { downloadAsJson } from "./helpers";

/**
 * Manages SSH key operations including migration, updating, exporting, deleting, and listing.
 */
class SSHKeysManagement {
  /**
   * Migrates an old SSH key string to the new SSHKeyData format.
   * @param oldKey The old SSH key string to migrate.
   * @returns An array containing the migrated SSHKeyData.
   */
  migrate(oldKey: string): SSHKeyData[] {
    const userKeys: SSHKeyData[] = [];
    const parts = oldKey.split(" ");
    let keyName = "";
    if (parts.length < 3) {
      keyName = this.generateName();
    } else {
      keyName = parts[parts.length - 1];
    }
    const newKey: SSHKeyData = {
      createdAt: this.formatDate(new Date()),
      name: keyName,
      id: 1,
      isActive: true,
      publicKey: oldKey,
    };
    userKeys.push(newKey);
    return userKeys;
  }

  /**
   * Checks if the SSH key has not been migrated yet.
   * @param key The SSH key to check for migration.
   * @returns A boolean indicating whether the key has not been migrated.
   */
  notMigrated(key: string | SSHKeyData[]): boolean {
    return typeof key === "string";
  }

  /**
   * Updates SSH keys in the profile and stores them in the grid.
   * @param keys The SSH keys to update.
   */
  async update(keys: SSHKeyData[]): Promise<void> {
    const profileManager = useProfileManager();
    const grid = await getGrid(profileManager.profile!);
    if (!grid) {
      createCustomToast(`Error occurred because the grid has not initialized yet.`, ToastType.danger);
      return;
    }
    const copiedKeys = keys.map(
      ({ fingerPrint, activating, deleting, ...keyWithoutSensitiveProps }) => keyWithoutSensitiveProps,
    );
    await storeSSH(grid!, copiedKeys);
    profileManager.updateSSH(copiedKeys);
  }

  /**
   * Generates a random name for an SSH key.
   * @returns The generated SSH key name.
   */
  generateName(): string {
    const words = [
      "moon",
      "earth",
      "sun",
      "star",
      "galaxy",
      "nebula",
      "comet",
      "planet",
      "asteroid",
      "satellite",
      "mercury",
      "venus",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
      "pluto",
      "meteor",
      "cosmos",
    ];
    const keyName = words.sort(() => Math.random() - 0.5)[0];
    return keyName;
  }

  /**
   * Parses an SSH public key string.
   * @param publicKey The SSH public key string to parse.
   * @returns An object containing the parsed parts of the public key.
   */
  parsePublicKey(publicKey: string) {
    const parts = publicKey.split(" ");
    return {
      type: parts[0],
      data: parts[1],
      comment: parts[2],
    };
  }

  /**
   * Calculates the fingerprint of an SSH public key.
   * @param publicKey The SSH public key string.
   * @returns The calculated fingerprint.
   */
  calculateFingerprint(publicKey: string): string {
    if (publicKey.length) {
      const sshPublicKey = this.parsePublicKey(publicKey);
      const md5 = crypto.createHash("md5");
      if (sshPublicKey.data) {
        md5.update(sshPublicKey.data);
        const fingerprint = md5
          .digest("hex")
          .replace(/(.{2})(?=.)/g, "$1:")
          .toUpperCase();
        return fingerprint;
      }
    }
    return "-";
  }

  /**
   * Exports SSH keys as a JSON file.
   * @param keys The SSH keys to export.
   */
  async export(keys: SSHKeyData[]): Promise<void> {
    const exportKeys: SSHKeyData[] = keys.map(({ deleting, activating, ...rest }) => rest);
    downloadAsJson(exportKeys, `ssh_keys.json`);
  }

  /**
   * Retrieves and formats SSH keys from the profile.
   * @returns An array of formatted SSHKeyData.
   */
  list(): SSHKeyData[] {
    const profileManager = useProfileManager();
    const keys = profileManager.profile!.ssh.map(key => ({
      ...key,
      fingerPrint: this.calculateFingerprint(key.publicKey),
    }));
    return keys;
  }

  /**
   * Formats a date into a string.
   * @param date The date to format.
   * @returns The formatted date string.
   */
  formatDate(date: Date): string {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  /**
   * Checks if a given string is a valid SSH key.
   * @param key - The SSH key string to be validated.
   * @returns True if the key is a valid SSH key, false otherwise.
   */
  isValidSSHKey(key: string): boolean {
    const sshKeyRegex = /^(ssh-rsa|ssh-dss|ecdsa-[a-zA-Z0-9-]+|ssh-ed25519)\s+(\S+)+\S/;
    return sshKeyRegex.test(key);
  }
}

export default SSHKeysManagement;
