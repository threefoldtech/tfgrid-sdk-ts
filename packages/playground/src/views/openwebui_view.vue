<template>
  <view-layout>
    <TfOpenwebui />

    <template #list>
      <TfDeploymentList title="Open WebUI Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfOpenwebui from "../weblets/tf_openwebui.vue";

export default {
  name: "OpenwebuiView",
  components: {
    TfOpenwebui,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Openwebui };
  },
};
</script>
