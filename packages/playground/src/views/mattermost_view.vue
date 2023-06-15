<template>
  <view-layout>
    <template #description
      >Mattermost A single point of collaboration. Designed specifically for digital operations.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_mattermost.html" class="app-link">
        read more about Mattermost
      </a></template
    >

    <TfMattermost />

    <template #list>
      <TfDeploymentList :project-name="name" />
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
