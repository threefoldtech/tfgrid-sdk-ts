<template>
  <view-layout>
    <template #description
      >Kubernetes is the standard container orchestration tool. On the TF grid, Kubernetes clusters can be deployed out
      of the box. We have implemented K3S, a full-blown Kubernetes offering that uses only half of the memory footprint.
      It is packaged as a single binary and made more lightweight to run workloads in resource-constrained locations
      (fits e.g. IoT, edge, ARM workloads).
      <a href="https://manual.grid.tf/weblets/weblets_k8s.html" target="_blank" class="app-link">
        read more about Kubernetes
      </a></template
    >

    <TfKubernetes />

    <template #list>
      <TfDeploymentList :project-name="name" />
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
