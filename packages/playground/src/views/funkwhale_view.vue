<template>
  <view-layout>
    <template #description
      >Funkwhale is social platform to enjoy and share music. Funkwhale is a community-driven project that lets you
      listen and share music and audio within a decentralized, open network.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_funkwhale.html" class="app-link">
        read more about Funkwhale
      </a></template
    >

    <TfFunkwhale />

    <template #list>
      <TfDeploymentList title="Funkwhale Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfFunkwhale from "../weblets/tf_funkwhale.vue";

export default {
  name: "FunkwhaleView",
  components: {
    TfFunkwhale,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Funkwhale };
  },
};
</script>
