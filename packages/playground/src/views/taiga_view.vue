<template>
  <view-layout>
    <template #description
      >Taiga is the project management tool for multi-functional agile teams. It has a rich feature set and at the same
      time it is very simple to start with through its intuitive user interface.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_taiga.html" class="app-link">
        read more about Taiga
      </a></template
    >

    <TfTaiga />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfTaiga from "../weblets/tf_taiga.vue";

export default {
  name: "TaigaView",
  components: {
    TfTaiga,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Taiga };
  },
};
</script>
