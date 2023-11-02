<template>
  <RouteToSolutions />
  <view-layout>
    <NodePilot />

    <template #list>
      <TfDeploymentList title="Node Pilot Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import NodePilot from "../weblets/tf_node_pilot.vue";

export default {
  name: "NodePilotView",
  components: {
    NodePilot,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.NodePilot };
  },
};
</script>
