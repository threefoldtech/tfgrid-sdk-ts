<template>
  <view-layout>
    <template #description
      >Casper Network is a blockchain protocol built from the ground up to remain true to core Web3 principles and adapt
      to the needs of our evolving world.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_casper.html" class="app-link">
        read more about Casperlabs
      </a></template
    >

    <tf-casperlabs />

    <template #list>
      <TfDeploymentList title="Casperlabs Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfCasperlabs from "../weblets/tf_casperlabs.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "CasperlabsView",
  components: {
    TfDeploymentList,
    TfCasperlabs,
  },
  setup() {
    return { name: ProjectName.Casperlabs };
  },
};
</script>
