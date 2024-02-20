<template>
  <view-layout>
    <Holohost />

    <template #list>
      <TfDeploymentList title="Holohost" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Holohost from "../weblets/tf_holohost.vue";

export default {
  name: "MicroVirtualMachine",
  components: {
    Holohost,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.VM };
  },
};
</script>
