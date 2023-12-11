import type { GridClient } from "@threefold/grid_client";
import { defineStore } from "pinia";

import { getGrid } from "@/utils/grid";

import type { Profile } from "./profile_manager";

interface IGrid {
  grid: GridClient;
  client: GridClient;
}

const useGrid = defineStore("grid-client", {
  state: (): IGrid => {
    return { grid: null as any, client: null as any };
  },

  actions: {
    async set(profile: Profile | null) {
      const gridClient = profile ? ((await getGrid(profile)) as any) : null;
      this.grid = gridClient;
      this.client = gridClient;
    },
  },
});

export { useGrid };
