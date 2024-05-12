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
  private oldKey = "";
  updateCost = 0.01;
  private words = [
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

  constructor() {
    const profileManager = useProfileManager();
    this.oldKey = profileManager.profile?.ssh as unknown as string;
  }

  /**
   * Migrates an old SSH key string to the new SSHKeyData format.
   * @returns An array containing the migrated SSHKeyData.
   */
  migrate(): SSHKeyData[] {
    const userKeys: SSHKeyData[] = [];

    let keyName = "";
    const parts = this.oldKey.split(" ");

    if (parts.length < 3) {
      keyName = this.generateName()!;
    } else {
      keyName = parts[parts.length - 1];
    }
    const newKey: SSHKeyData = {
      createdAt: this.formatDate(new Date()),
      name: keyName,
      id: 1,
      isActive: true,
      publicKey: this.oldKey,
    };
    userKeys.push(newKey);
    return userKeys;
  }

  /**
   * Checks if the SSH key has not been migrated yet.
   * @returns A boolean indicating whether the key has not been migrated.
   */
  migrated(): boolean {
    return typeof this.oldKey !== "string";
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
   * Generates a random name for an SSH key that is not included in the blocked names<user keys>.
   * @returns The generated SSH key name.
   * @throws Error if all names are blocked.
   */
  generateName(): string | null {
    // Filter out names that are already used
    const blockedNames = this.list().map(key => key.name);
    const availableNames = this.words.filter(name => !blockedNames.includes(name));

    if (availableNames.length === 0) {
      return null;
    }

    // Generate a random name from the available names
    return availableNames[Math.floor(Math.random() * availableNames.length)];
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
    let keys: SSHKeyData[] = [];

    if (this.migrated()) {
      keys = this.oldKey as unknown as SSHKeyData[];
    }

    // Profile created for the first time.
    if (!keys) {
      return [];
    }

    keys = keys.map(key => ({
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

  /**
   * Checks if a given name is available by checking if there is another key with the same name.
   * @param keyName - The key name to be validated.
   * @returns True if the keyName is available to use, false otherwise.
   */
  availableName(keyName: string): boolean {
    return !this.list().some(key => key.name === keyName);
  }

  /**
   * Checks if a given SSH public key is available by checking if there is another key with the same public key.
   * @param publicKey - The SSH public key to be validated.
   * @returns True if the publicKey is available to use, false otherwise.
   */
  availablePublicKey(publicKey: string): boolean {
    return !this.list().some(key => key.publicKey === publicKey);
  }
}

export default SSHKeysManagement;
