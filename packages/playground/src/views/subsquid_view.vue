<template>
  <view-layout>
    <Subsquid />

    <template #list>
      <TfDeploymentList title="Subsquid Instances" :project-name="name" />
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
