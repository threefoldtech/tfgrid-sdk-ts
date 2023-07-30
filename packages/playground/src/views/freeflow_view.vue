<template>
  <view-layout>
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
