<template>
  <div>
    <FullVm />

    <div class="mt-4">
      <TfDeploymentList title="Virtual Machines" :project-name="name" />
    </div>
  </div>
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
