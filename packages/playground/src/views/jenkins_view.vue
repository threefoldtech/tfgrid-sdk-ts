<template>
  <view-layout>
    <Jenkins />

    <template #list>
      <TfDeploymentList title="Jenkins" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import Jenkins from "../weblets/jenkins.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "JenkinsView",
  components: {
    Jenkins,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Jenkins };
  },
};
</script>
