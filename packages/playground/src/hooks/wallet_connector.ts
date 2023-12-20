import { inject, provide, type Ref } from "vue";

const key = Symbol("threefold:wallet-connector");

export interface WalletService {
  active: Ref<boolean>;
}

export function provideWalletService(service: WalletService) {
  return provide(key, service);
}

export function useWalletService() {
  return inject(key) as WalletService;
}
