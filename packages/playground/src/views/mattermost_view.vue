<template>
  <view-layout>
    <TfMattermost />

    <template #list>
      <TfDeploymentList title="Mattermost Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfMattermost from "../weblets/tf_mattermost.vue";

export default {
  name: "MattermostView",
  components: {
    TfMattermost,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Mattermost };
  },
};
</script>
