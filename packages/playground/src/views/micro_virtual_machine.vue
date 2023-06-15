<template>
  <div>
    <MicroVm />

    <div class="mt-4">
      <TfDeploymentList title="Micro Virtual Machines" :project-name="name" />
    </div>
  </div>
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
