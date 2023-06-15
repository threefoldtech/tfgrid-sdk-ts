<template>
  <view-layout>
    <template #description
      >Subsquid indexer is a piece of software that reads all the blocks from a Substrate based blockchain, decodes and
      stores them for processing in a later stage.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_subsquid.html" class="app-link">
        read more about subsquid
      </a></template
    >

    <Subsquid />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Subsquid from "../weblets/tf_subsquid.vue";

export default {
  name: "SubsquidView",
  components: {
    Subsquid,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Subsquid };
  },
};
</script>
