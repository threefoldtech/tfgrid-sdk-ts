<template>
  <view-layout>
    <template #description
      >Umbrel is an OS for running a personal server in your home. Self-host open source apps like Nextcloud, Bitcoin
      node, and more.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_umbrel.html" class="app-link">
        read more about Umbrel
      </a></template
    >

    <TfUmbrel />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfUmbrel from "../weblets/tf_umbrel.vue";

export default {
  name: "UmbrelView",
  components: {
    TfUmbrel,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Umbrel };
  },
};
</script>
