<template>
  <NodePilot />

  <div class="mt-4">
    <TfDeploymentList :project-name="name" />
  </div>
</template>

<script lang="ts">
import { ProjectName } from '../types'
import TfDeploymentList from '../weblets/tf_deployment_list.vue'
import NodePilot from '../weblets/tf_node_pilot.vue'

export default {
  name: 'NodePilotView',
  components: {
    NodePilot,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.NodePilot }
  },
}
</script>
