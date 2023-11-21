<template>
  <slot />
</template>

<script lang="ts">
import { inject, provide } from "vue";

export type Callback = () => void | Promise<void>;

export interface DialogService {
  register(id: number): void;
  unregister(id: number): void;

  enqueue(fn: Callback): void;
  dequeue(fn: Callback): void;
}

export const KEY = Symbol("dialog-lock-service");

export function useDialogService() {
  return inject(KEY) as DialogService;
}

export default {
  name: "DialogLockService",
  setup() {
    const ids = new Set<number>();
    const fns = new Set<Callback>();

    let _locked = false;
    async function updateLock() {
      if (_locked || ids.size > 0 || fns.size === 0) {
        return;
      }

      try {
        _locked = true;
        // Set works like queue in order
        const [fn] = fns;
        fns.delete(fn);
        await fn();
      } catch {
        /* Ignore */
      } finally {
        _locked = false;
        updateLock();
      }
    }

    const service: DialogService = {
      register(id) {
        if (ids.has(id)) {
          return;
        }

        ids.add(id);
        updateLock();
      },

      unregister(id) {
        if (!ids.has(id)) {
          return;
        }

        ids.delete(id);
        updateLock();
      },

      enqueue(fn) {
        if (fns.has(fn)) {
          return;
        }

        fns.add(fn);
        updateLock();
      },

      dequeue(fn) {
        if (!fns.has(fn)) {
          return;
        }

        fns.delete(fn);
        updateLock();
      },
    };

    provide(KEY, service);
  },
};
</script>
