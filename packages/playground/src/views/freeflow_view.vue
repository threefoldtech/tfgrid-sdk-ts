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
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfFreeflow from "../weblets/tf_freeflow.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
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
