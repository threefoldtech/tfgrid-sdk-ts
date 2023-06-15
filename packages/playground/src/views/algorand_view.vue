<template>
  <view-layout>
    <template #description
      >Algorand (ALGO) is a blockchain platform and cryptocurrency designed to function like a major payments processor.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_algorand.html" class="app-link">
        read more about Algorand
      </a>
    </template>

    <TfAlgorand />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfAlgorand from "../weblets/tf_algorand.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "AlgorandView",
  components: {
    TfAlgorand,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Algorand };
  },
};
</script>
