<template>
  <Subsquid />

  <div class="mt-4">
    <TfDeploymentList :project-name="name" />
  </div>
</template>

<script lang="ts">
import { ProjectName } from '../types'
import TfDeploymentList from '../weblets/tf_deployment_list.vue'
import Subsquid from '../weblets/tf_subsquid.vue'

export default {
  name: 'SubsquidView',
  components: {
    Subsquid,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Subsquid }
  },
}
</script>
