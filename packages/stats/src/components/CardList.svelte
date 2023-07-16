<script lang="ts">
  import type { IStatsRes } from "../utils/fetchData";
  import CardDetails from "./CardDetails.svelte";

  interface IStats {
    id: number;
    data: number;
    title: string;
    icon: string;
  }

  export let data: IStatsRes;
  let stats: IStats[] = [];

  function CountryCount(): number {
    const countries = new Set(Object.keys(data.nodesDistribution));

    return countries.size;
  }

  $: if (data)
    stats = [
      {
        id: 0,
        data: data.nodes,
        title: "Nodes Online",
        icon: "/assets/node.svg",
      },
      {
        id: 1,
        data: data.farms,
        title: "Farms",
        icon: "/assets/farms.svg",
      },
      {
        id: 2,
        data: CountryCount(),
        title: "Countries",
        icon: "/assets/countries.svg",
      },
      {
        id: 3,
        data: data.totalCru,
        title: "CPUs",
        icon: "/assets/cpu.svg",
      },
      {
        id: 4,
        data: data.totalSru,
        title: "SSD Storage",
        icon: "/assets/ssd.svg",
      },
      {
        id: 5,
        data: data.totalHru,
        title: "HDD Storage",
        icon: "/assets/hdd.svg",
      },
      {
        id: 6,
        data: data.totalMru,
        title: "RAM",
        icon: "/assets/ram.svg",
      },
      {
        id: 7,
        data: data.gpus,
        title: "GPUs",
        icon: "/assets/gpu.svg",
      },
      {
        id: 8,
        data: data.gateways,
        title: "Gateways",
        icon: "/assets/gateways.svg",
      },
      {
        id: 9,
        data: data.twins,
        title: "Twins",
        icon: "/assets/twin.svg",
      },
      {
        id: 10,
        data: data.publicIps,
        title: "Public IPs",
        icon: "/assets/access.svg",
      },
      {
        id: 11,
        data: data.contracts,
        title: "Contracts",
        icon: "/assets/contract.svg",
      },
    ];
</script>

<div class="card-list">
  {#each stats as card, index (card.id)}
    <CardDetails {card} secondaryTitle={index % 2 === 0} />
  {/each}
</div>

<style>
  .card-list {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
  }
</style>
