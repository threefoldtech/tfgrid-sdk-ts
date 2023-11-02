<template>
  <RouteToSolutions />
  <view-layout>
    <TfOwncloud />

    <template #list>
      <TfDeploymentList title="Owncloud Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfOwncloud from "../weblets/tf_owncloud.vue";

export default {
  name: "MattermostView",
  components: {
    TfOwncloud,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Owncloud };
  },
};
</script>
