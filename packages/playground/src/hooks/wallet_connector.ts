import type { KeypairType } from "@threefold/grid_client";
import Cryptr from "cryptr";
import md5 from "md5";
import { type App, computed, inject, type Ref, ref, type UnwrapRef } from "vue";

import type { Profile } from "../stores/profile_manager";
import { getGrid, loadProfile } from "../utils/grid";
import { resolveAsync } from "../utils/nodeSelector";
import { useLocalStorage, useSessionStorage } from "./useStorage";

const version = 1;
export const $key = "wallet.v" + version;

export interface WalletService {
  $key: string;
  active: Ref<boolean>;
  passwordStorage: ReturnType<typeof useSessionStorage>;
  localCredentials: ReturnType<typeof useLocalCredentials>;
  extensionCredentials: ReturnType<typeof useExtensionCredentials>;
  login(profile: Profile): Promise<void>;
  logout(): void;
  locked: Ref<boolean>;
  activeTab: Ref<number>;
  reloadBalance(): Promise<void>;
}

export function provideWalletService(app: App<Element>, service: WalletService) {
  app.provide($key, service);
  return service;
}

export function useWalletService() {
  return inject($key) as WalletService;
}

export function useWalletServiceCmp() {
  return ref() as Ref<UnwrapRef<WalletService>>;
}

export interface EncryptedLocalCredentials {
  passwordHash: string;
  mnemonicHash: string;
  keypairTypeHash: string;
}

function isLocalCredentialsObject(maybeCredentials: any): maybeCredentials is EncryptedLocalCredentials {
  return (
    maybeCredentials &&
    typeof maybeCredentials === "object" &&
    maybeCredentials.passwordHash &&
    typeof maybeCredentials.passwordHash === "string" &&
    maybeCredentials.mnemonicHash &&
    typeof maybeCredentials.mnemonicHash === "string" &&
    maybeCredentials.keypairTypeHash &&
    typeof maybeCredentials.keypairTypeHash === "string"
  );
}

function createCryptr(password: string) {
  return new Cryptr(password, { pbkdf2Iterations: 10, saltLength: 10 });
}

export function useLocalCredentials() {
  const storedCredentials = useLocalStorage($key);

  const credentials = computed<EncryptedLocalCredentials | undefined>(() => {
    try {
      const credentials = JSON.parse(storedCredentials.value || "");
      if (isLocalCredentialsObject(credentials)) {
        return credentials;
      }
    } catch {
      return undefined;
    }

    return undefined;
  });

  return {
    get value() {
      return credentials.value;
    },
    set(password: string, mnemonic: string, keypairType: string) {
      const cryptr = createCryptr(password);
      const mnemonicHash = cryptr.encrypt(mnemonic);
      const keypairTypeHash = cryptr.encrypt(keypairType);
      const passwordHash = md5(password);
      storedCredentials.value = JSON.stringify({ passwordHash, mnemonicHash, keypairTypeHash });
    },
    get(password?: string) {
      const c = credentials.value;

      if (!c || !password || c.passwordHash !== md5(password)) {
        return undefined;
      }

      try {
        const cryptr = createCryptr(password);
        return {
          mnemonic: cryptr.decrypt(c.mnemonicHash),
          keypairType: cryptr.decrypt(c.keypairTypeHash) as KeypairType,
        };
      } catch {
        return undefined;
      }
    },
    check(password: string): boolean {
      const passwordHash = md5(password);
      const c = credentials.value;

      if (c && c.passwordHash === passwordHash) {
        return true;
      }

      return false;
    },
    remove() {
      storedCredentials.value = undefined;
    },
  };
}

export interface ExtensionCredentials {
  mnemonic: string;
  keypairType: string;
}

function isExtensionCredentialsObject(maybeCredentials: any): maybeCredentials is ExtensionCredentials {
  return (
    maybeCredentials &&
    typeof maybeCredentials === "object" &&
    maybeCredentials.mnemonic &&
    typeof maybeCredentials.mnemonic === "string" &&
    maybeCredentials.keypairType &&
    typeof maybeCredentials.keypairType === "string"
  );
}

export function useExtensionCredentials() {
  const storedCredentials = useSessionStorage("credentials");

  const credentials = computed<ExtensionCredentials | undefined>(() => {
    try {
      const credentials = JSON.parse(atob(storedCredentials.value || ""));
      if (isExtensionCredentialsObject(credentials)) {
        return credentials;
      }
    } catch {
      return undefined;
    }

    return undefined;
  });

  return {
    get value() {
      return credentials.value;
    },
    set(mnemonic: string, keypairType: string) {
      storedCredentials.value = btoa(JSON.stringify({ mnemonic, keypairType }));
    },
    remove() {
      storedCredentials.value = undefined;
    },
  };
}

export async function connectAndLoginProfile(
  walletService: ReturnType<typeof useWalletService>,
  mnemonic: string,
  keypairType: KeypairType,
) {
  const [grid, e0] = await resolveAsync(getGrid({ mnemonic, keypairType }));
  if (!grid || e0) {
    throw `Failed to instantiate connection to chain.`;
  }

  const [profile, e1] = await resolveAsync(loadProfile(grid));
  if (!profile || e1) {
    throw `Failed to load user profile.`;
  }

  const [, e2] = await resolveAsync(walletService.login(profile));
  if (e2) {
    // This should never be the case
    throw `Failed to login to your wallet.`;
  }
}
