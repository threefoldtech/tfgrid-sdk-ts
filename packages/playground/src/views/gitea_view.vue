<template>
  <view-layout>
    <Gitea />

    <template #list>
      <TfDeploymentList title="Gitea" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Gitea from "../weblets/tf_gitea.vue";

export default {
  name: "GiteaView",
  components: {
    Gitea,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Gitea };
  },
};
</script>
