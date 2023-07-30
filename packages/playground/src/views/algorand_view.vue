<template>
  <view-layout>
    <TfAlgorand />

    <template #list>
      <TfDeploymentList title="Algorand Instances" :project-name="name" />
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
