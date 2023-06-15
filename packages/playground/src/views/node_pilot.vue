<template>
  <view-layout>
    <template #description
      >Deploy, manage, and monetize crypto nodes with a few clicks. Seamless Docker integration brings enterprise-level
      security and scalability.
      <a class="app-link" href="https://manual.grid.tf/weblets/weblets_nodepilot.html" target="_blank">
        read more about NodePilot
      </a></template
    >

    <NodePilot />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import NodePilot from "../weblets/tf_node_pilot.vue";

export default {
  name: "NodePilotView",
  components: {
    NodePilot,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.NodePilot };
  },
};
</script>
