<template>
  <view-layout>
    <StaticWebsite />

    <template #list>
      <TfDeploymentList title="Static Website Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import StaticWebsite from "../weblets/tf_staticwebsite.vue";

export default {
  name: "CaddyView",
  components: {
    StaticWebsite,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.StaticWebsite };
  },
};
</script>
