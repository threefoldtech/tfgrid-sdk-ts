<template>
  <view-layout>
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
