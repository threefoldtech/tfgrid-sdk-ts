import { KeypairType } from "@threefold/grid_client";
import crypto from "crypto";

import { useProfileManager } from "@/stores";
import { SSHKeyData } from "@/types";

import { formatSSHKeyTableCreatedAt } from "./date";
import { getGrid, getMetadata, storeSSH } from "./grid";
import { generateSSHKeyName } from "./strings";

export async function migrateOldKey(publicSSHKey: string) {
  const allKeys: SSHKeyData[] = [];
  const parts = publicSSHKey.split(" ");
  let keyName = "";
  if (parts.length < 3) {
    keyName = generateSSHKeyName();
  } else {
    keyName = parts[parts.length - 1];
  }
  const newKey: SSHKeyData = {
    createdAt: formatSSHKeyTableCreatedAt(new Date()),
    name: keyName,
    id: 1,
    isActive: true,
    publicKey: publicSSHKey,
  };

  allKeys.push(newKey);
  await updateSSHKeysInChain();
  newKey.fingerPrint = await calculateFingerprint(publicSSHKey);
}

export async function updateSSHKeysInChain() {
  const allKeys: SSHKeyData[] = [];
  const copiedKeys = allKeys.map(key => {
    // Remove the fingerprint, activating, and deleting before saving the key to the chain
    const { fingerPrint, activating, deleting, ...keyWithoutSensitiveProps } = key;
    return keyWithoutSensitiveProps;
  });

  // Update the chain with the current sshkeys => this.allkeys
  const profileManager = useProfileManager();

  const grid = await getGrid(profileManager.profile!);
  await getMetadata(grid!);
  await storeSSH(grid!, copiedKeys);
  profileManager.updateSSH(copiedKeys);
}

export async function calculateFingerprint(publicKey: string) {
  if (publicKey.length) {
    const sshPublicKey = parsePublicKey(publicKey);
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

export function parsePublicKey(publicKey: string) {
  const parts = publicKey.split(" ");
  return {
    type: parts[0],
    data: parts[1],
    comment: parts[2],
  };
}

export async function migrateSshKeys(mnemonic: string, keypairType: KeypairType) {
  const profileManager = useProfileManager();
  const grid = await getGrid({ mnemonic, keypairType });
  const metaData = await getMetadata(grid!);
  let allKeys: SSHKeyData[] = [];

  if (typeof metaData.sshkey === "string") {
    migrateOldKey(metaData.sshkey);
  } else {
    if (!metaData.sshkey) {
      profileManager.updateSSH(allKeys);
    }
    allKeys = metaData.sshkey || [];
    if (allKeys) {
      // Calculate the fingerprint for each key after saving them to the chain
      allKeys = await Promise.all(
        allKeys.map(async key => {
          const fingerprint = await calculateFingerprint(key.publicKey);
          return { ...key, fingerPrint: fingerprint };
        }),
      );
    }
  }
}
