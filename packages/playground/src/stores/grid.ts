import type { GridClient } from "@threefold/grid_client";
import { defineStore } from "pinia";

import { getGrid } from "@/utils/grid";

import type { Profile } from "./profile_manager";

interface IGrid {
  grid: GridClient;
}

const useGrid = defineStore("grid-client", {
  state: (): IGrid => {
    return { grid: null as any };
  },

  actions: {
    async set(profile: Profile | null) {
      this.grid = profile ? ((await getGrid(profile)) as any) : null;
    },
  },
});

export { useGrid };
