<template>
  <view-layout>
    <NodePilot />

    <template #list>
      <TfDeploymentList title="Node Pilot Instances" :project-name="name" />
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
