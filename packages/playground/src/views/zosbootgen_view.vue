<template>
  <view-layout>
    <tf-casperlabs />

    <template #list>
      <TfDeploymentList title="ZOS Boot Generator Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfCasperlabs from "../weblets/tf_zosbootgen.vue";

export default {
  name: "ZOSBootGenView",
  components: {
    TfDeploymentList,
    TfCasperlabs,
  },
  setup() {
    return { name: ProjectName.ZOSBootGen };
  },
};
</script>
