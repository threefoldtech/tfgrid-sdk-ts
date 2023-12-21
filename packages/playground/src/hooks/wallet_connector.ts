import Cryptr from "cryptr";
import md5 from "md5";
import { computed, inject, provide, type Ref } from "vue";

import { useLocalStorage, useSessionStorage } from "./useStorage";

const version = 1;
export const $key = "wallet.v" + version;

export interface WalletService {
  $key: string;
  active: Ref<boolean>;
}

export function provideWalletService(service: WalletService) {
  return provide($key, service);
}

export function useWalletService() {
  return inject($key) as WalletService;
}

export interface EncryptedCredentials {
  passwordHash: string;
  mnemonicHash: string;
}

function isCredentialsObject(maybeCredentials: any) {
  return (
    typeof maybeCredentials === "object" &&
    maybeCredentials.passwordHash &&
    typeof maybeCredentials.passwordHash === "string" &&
    maybeCredentials.mnemonicHash &&
    typeof maybeCredentials.mnemonicHash === "string"
  );
}

function createCryptr(password: string) {
  return new Cryptr(password, { pbkdf2Iterations: 10, saltLength: 10 });
}

export function useCredentials() {
  const storedCredentials = useLocalStorage($key);

  const credentials = computed<EncryptedCredentials | undefined>(() => {
    try {
      const credentials = JSON.parse(storedCredentials.value || "");
      if (isCredentialsObject(credentials)) {
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
    set(password: string, mnemonic: string) {
      const cryptr = createCryptr(password);
      const mnemonicHash = cryptr.encrypt(mnemonic);
      const passwordHash = md5(password);
      storedCredentials.value = JSON.stringify({ passwordHash, mnemonicHash });
    },
    getMnemonic(password?: string): string | undefined {
      const c = credentials.value;

      if (!c || !password || c.passwordHash !== md5(password)) {
        return undefined;
      }

      try {
        const cryptr = createCryptr(password);
        return cryptr.decrypt(c.mnemonicHash);
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
