<template>
  <TfDeploymentList />
</template>

<script lang="ts">
import TfDeploymentList from '../weblets/tf_deployment_list.vue'

export default {
  name: 'DeploymentList',
  components: {
    TfDeploymentList,
  },
}
</script>
