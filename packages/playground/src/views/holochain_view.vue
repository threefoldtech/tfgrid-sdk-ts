<template>
  <view-layout>
    <Holochain />

    <template #list>
      <TfDeploymentList title="Holochain" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Holochain from "../weblets/tf_holochain.vue";

export default {
  name: "MicroVirtualMachine",
  components: {
    Holochain,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.VM };
  },
};
</script>
