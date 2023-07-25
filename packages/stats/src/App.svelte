<script lang="ts">
  import { onMount } from "svelte";
  
  import CardList from "./components/CardList.svelte";
  import { fetchData, IStatsRes } from "./utils/fetchData";
  import { status } from "./utils/fetchData";

  let data: IStatsRes;
  let loading = true;
  let error: string;

  $: disabled = false;

  const refresh = async () => {
    try {
      disabled = true;
      data = await fetchData();
    } catch (err) {
      error = err;
      console.log("Statistics couldn't load due to:", err);
    } finally {
      loading = false;
      disabled = false;
    }
  };

  onMount(async () => {
    refresh();
  });

  function networks() {
    const networks = Object.entries($status)
      .filter(x => x[1])
      .map(x => x[0]);
    return `Please note that the current node distribution is for ${networks.join(", ")} net(s).`;
  }
</script>

<main>
  <div>
    <button class="refresh" on:click={refresh} {disabled} class:disabled>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        fill="currentColor"
        class="bi bi-arrow-clockwise"
        viewBox="0 0 16 16"
      >
        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
      </svg></button
    >
  </div>
  {#if loading}
    <div class:lds-dual-ring={loading} />
  {:else if data}
    <h2 class="node-title map-container">Node Distribution</h2>
    <div class="networks">
      <p>{networks()}</p>
    </div>
    <div class="map-container">
      <div class="map">
        <tf-map r="76" g="187" b="217" nodes={JSON.stringify(data.nodesDistribution)} />
      </div>
    </div>
    <div class="map-container">
      <div class="state-title">
        <h2>Statistics</h2>
        <CardList {data} />
      </div>
    </div>
  {:else}
    <p>Something went wrong. Please try again later.</p>
  {/if}
</main>

<style>
  p {
    margin: 8px;
    padding: 15px;
  }
  .refresh {
    border: none;
    background: #333;
    position: absolute;
    right: 0.5rem;
    top: 0.2rem;
    color: white;
    border-radius: 0;
  }
  .disabled {
    background-color: rgba(221, 221, 221, 0.633);
  }
  main {
    background-color: #ebe7e7;
    min-height: 100vh;
  }

  .map-container {
    display: flex;
    justify-content: center;
    padding: 0.7rem 0rem;
  }
  .map {
    width: 55rem;
    display: inline-block;
  }

  .networks {
    position: relative;
    /* top: 5%; */
    font-size: 1.1rem;
    text-align: center;
    color: #fff;
    background-color: #1982b1;
  }
  .state-title,
  .node-title {
    background-color: #333;
    color: #fff;
    text-align: center;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    padding: 0.6rem;
    font-weight: 400;
  }

  .lds-dual-ring {
    display: inline-block;
    margin: auto;
    width: 80px;
    height: 80px;
  }
  .lds-dual-ring:after {
    content: " ";
    display: inline-block;
    width: 64px;
    height: 64px;
    margin: auto;
    border-radius: 50%;
    border: 6px solid black;
    border-color: black transparent black transparent;
    animation: lds-dual-ring 1.2s linear infinite;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
