<template>
  <view-layout>
    <TfExpose />

    <template #list>
      <TfDeploymentList title="Expose" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfExpose from "../weblets/tf_expose.vue";

export default {
  name: "ExposeView",
  components: {
    TfExpose,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Expose };
  },
};
</script>
