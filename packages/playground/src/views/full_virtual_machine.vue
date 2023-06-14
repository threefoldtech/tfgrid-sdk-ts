<template>
  <view-layout>
    <template #description> here goes description! write whatever markup u need </template>

    <FullVm />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import FullVm from "../weblets/full_vm.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "FullVirtualMachine",
  components: {
    FullVm,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Fullvm };
  },
};
</script>
