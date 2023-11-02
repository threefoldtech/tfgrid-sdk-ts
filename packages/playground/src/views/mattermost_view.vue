<template>
  <RouteToSolutions />
  <view-layout>
    <TfMattermost />

    <template #list>
      <TfDeploymentList title="Mattermost Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfMattermost from "../weblets/tf_mattermost.vue";

export default {
  name: "MattermostView",
  components: {
    TfMattermost,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Mattermost };
  },
};
</script>
