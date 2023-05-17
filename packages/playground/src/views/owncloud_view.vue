<template>
  <TfOwncloud />

  <div class="mt-4">
    <TfDeploymentList :project-name="name" />
  </div>
</template>

<script lang="ts">
import { ProjectName } from '../types'
import TfDeploymentList from '../weblets/tf_deployment_list.vue'
import TfOwncloud from '../weblets/tf_owncloud.vue'

export default {
  name: 'MattermostView',
  components: {
    TfOwncloud,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Owncloud }
  },
}
</script>
