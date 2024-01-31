import type { Stats } from "@threefold/gridproxy_client";
import { defineStore } from "pinia";
import { computed } from "vue";

import { useAsync } from "@/hooks";
const urls = [
  "https://gridproxy.grid.tf/stats?status=up",
  "https://gridproxy.grid.tf/stats?status=standby",
  "https://gridproxy.test.grid.tf/stats?status=up",
  "https://gridproxy.test.grid.tf/stats?status=standby",
  "https://gridproxy.dev.grid.tf/stats?status=up",
  "https://gridproxy.dev.grid.tf/stats?status=standby",
];

const DUMMY_DATA = {
  capacity: "32.59 PB",
  nodes: 2552,
  countries: 60,
  cores: 63706,
};

export const useRequestStore = defineStore("request-store", () => {
  const res = useAsync(() => Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))), {
    init: true,
  });
  const loading = computed(() => res.value.loading);
  const data = computed(() => mergeStatsData(res.value.data));
  const error = computed(() => res.value.error);
  return { loading, data, error };
});

function mergeStatsData(stats: any[] | null) {
  if (!stats || stats.length == 0) return DUMMY_DATA;
  const res = stats[0];
  for (let i = 1; i < stats.length; i++) {
    res.nodes += stats[i].nodes;
    res.totalCru += stats[i].totalCru;
    res.totalHru += stats[i].totalHru;
    res.totalSru += stats[i].totalSru;
    res.nodesDistribution = mergeNodeDistribution([res.nodesDistribution, stats[i].nodesDistribution]);
    res.countries = Object.keys(res.nodesDistribution).length;
  }

  return {
    capacity: toTeraOrGiga(res.totalHru + res.totalSru),
    nodes: res.nodes,
    countries: res.countries,
    cores: res.totalCru,
  };
}

function mergeNodeDistribution(stats: Stats["nodesDistribution"][]) {
  const keys = new Set(stats.map(obj => Object.keys(obj)).flat());

  return Array.from(keys).reduce((res, key) => {
    res[key] = 0;
    stats.forEach(country => {
      res[key] += country[key] ?? 0;
    });
    return res;
  }, {} as { [key: string]: number });
}

function toTeraOrGiga(value: number) {
  const giga = 1024 ** 3;

  if (!value) return "0";

  const val = +value;
  if (val === 0 || isNaN(val)) return "0";

  if (val < giga) return val.toString();

  let gb = val / giga;

  if (gb < 1024) return `${gb.toFixed(2)} GB`;

  gb = gb / 1024;

  if (gb < 1024) return `${gb.toFixed(2)} TB`;

  gb = gb / 1024;
  return `${gb.toFixed(2)} PB`;
}
