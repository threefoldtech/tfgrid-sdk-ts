<template>
  <view-layout>
    <template #description
      >Freeflow is a convenient ecosystem on top of a resilient internet grid. We bring you a new internet with a set of
      productivity tools so you can enhance collaboration within your country, your company, your community.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_freeflow.html" class="app-link">
        read more about Freeflow
      </a></template
    >

    <tf-freeflow />

    <template #list>
      <TfDeploymentList title="Freeflow Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfFreeflow from "../weblets/freeflow.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "Freeflow",
  components: {
    TfDeploymentList,
    TfFreeflow,
  },
  setup() {
    return { name: ProjectName.FreeFlow };
  },
};
</script>
