<template>
  <RouteToSolutions />
  <view-layout>
    <FullVm />

    <template #list>
      <TfDeploymentList title="Virtual Machines" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import FullVm from "../weblets/full_vm.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "FullVirtualMachine",
  components: {
    FullVm,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Fullvm };
  },
};
</script>
