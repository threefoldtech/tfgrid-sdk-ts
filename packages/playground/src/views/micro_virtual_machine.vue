<template>
  <view-layout>
    <MicroVm />

    <template #list>
      <TfDeploymentList title="Micro Virtual Machines" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import MicroVm from "../weblets/tf_micro_vm.vue";

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
