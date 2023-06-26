import { get, writable } from "svelte/store";

import getBalance from "../utils/getBalance";

interface IStore {
  loading: boolean;
  balance: number | number;
  locked: number | number;
}

function createBalanceStore() {
  const store = writable<IStore>({
    loading: false,
    balance: null,
    locked: null,
  });
  const { subscribe, update } = store;

  const fullStore = {
    subscribe,

    getBalance() {
      return get(store).balance;
    },

    setBalance(value: number) {
      return update(s => {
        s.balance = value;
        return s;
      });
    },

    setLockedBalance(value: number) {
      return update(s => {
        s.locked = value;
        return s;
      });
    },

    setLoading(value: boolean) {
      return update(s => {
        s.loading = value;
        return s;
      });
    },

    updateBalance(times = 0) {
      const profile = get(window.configs.baseConfig);
      if (!profile) return;

      fullStore.setLoading(true);

      getBalance(profile)
        .then(balance => {
          fullStore.setBalance(balance.free);
          fullStore.setLockedBalance(balance.frozen);
        })
        .catch(err => {
          console.log("Balance Error", err);
          if (times < 3) fullStore.updateBalance(times + 1);
        })
        .finally(() => {
          fullStore.setLoading(false);
        });
    },
  };

  requestAnimationFrame(() => {
    let _interval: any;

    window.configs.baseConfig.subscribe(profile => {
      if (_interval) clearInterval(_interval);
      _interval = null;
      if (profile === null) return;

      fullStore.updateBalance();
      setInterval(() => fullStore.updateBalance(), 60 * 1000);
    });
  });

  return fullStore;
}

export default createBalanceStore();
