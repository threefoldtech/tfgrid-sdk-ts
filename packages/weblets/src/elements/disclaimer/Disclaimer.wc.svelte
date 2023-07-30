<svelte:options tag="tf-disclaimer" />

<script lang="ts">
  const envs = {
    dev: {
      env: "development",
      url: "https://github.com/threefoldtech/test_feedback/issues",
      playground: "https://playground.dev.grid.tf/#/",
    },
    test: {
      env: "testing",
      url: "https://github.com/threefoldtech/test_feedback/issues",
      playground: "https://playground.test.grid.tf/#/",
    },
    qa: {
      env: "QA",
      url: "https://github.com/threefoldtech/test_feedback/issues",
      playground: "https://playground.qa.grid.tf/#/",
    },
    custom: {
      env: "customized",
      url: "https://github.com/threefoldtech/test_feedback/issues",
      playground: "https://playground.grid.tf/#/",
    },
  };

  $: env = envs[window.env?.NETWORK];
</script>

<div style="padding: 15px; margin-top: 20px; ">
  <form class="box" style="background-color: #edd986;">
    <p class="is-size-4 has-text-weight-bold">Warning</p>
    <p>
      This website is deprecated, please use the new <a
        href={env.playground || "https://playground.grid.tf/#/"}
        class="has-text-weight-bold">Playground</a
      >
    </p>
  </form>
</div>

{#if env}
  <div style="padding: 15px;">
    <form class="box">
      <p class="is-size-4 has-text-weight-bold">Disclaimer</p>
      <p>
        This is a {env.env} environment. We're still ironing out the kinks. If there are any issues, please let us know
        <a href={env.url} target="_blank"> here. </a>
      </p>
    </form>
  </div>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
