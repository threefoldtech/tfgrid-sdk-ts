import { defineStore } from "pinia";
import { computed } from "vue";

import { useAsync } from "@/hooks";
const url = window.env.STATS_URL || "https://stats.grid.tf";

export const useRequestStore = defineStore("request-store", () => {
  const res = useAsync(() => fetch(url + "/api/stats-summary").then(resp => resp.json()), {
    init: true,
  });
  const data = computed(() => res.value.data);
  return { data };
});
