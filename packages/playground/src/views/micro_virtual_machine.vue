<template>
  <RouteToSolutions />
  <view-layout>
    <MicroVm />

    <template #list>
      <TfDeploymentList title="Micro Virtual Machines" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import MicroVm from "../weblets/micro_vm.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "MicroVirtualMachine",
  components: {
    MicroVm,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.VM };
  },
};
</script>
