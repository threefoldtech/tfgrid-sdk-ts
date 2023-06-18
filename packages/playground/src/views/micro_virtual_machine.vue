<template>
  <view-layout>
    <template #description>Deploy your own Micro Virtual Machine</template>

    <MicroVm />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import MicroVm from "../weblets/micro_vm.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "MicroVirtualMachine",
  components: {
    MicroVm,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.VM };
  },
};
</script>
