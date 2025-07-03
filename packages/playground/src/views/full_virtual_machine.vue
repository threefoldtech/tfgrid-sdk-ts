<template>
  <view-layout>
    <FullVm />

    <template #list>
      <TfDeploymentList title="Virtual Machines" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import FullVm from "../weblets/tf_full_vm.vue";

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
