<template>
  <view-layout>
    <TfKubernetes />

    <template #list>
      <TfDeploymentList title="Kubernetes Clusters" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfKubernetes from "../weblets/tf_kubernetes.vue";

export default {
  name: "KubernetesView",
  components: {
    TfKubernetes,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Kubernetes };
  },
};
</script>
