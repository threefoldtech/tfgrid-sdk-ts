<template>
  <view-layout>
    <TfDiscourse />

    <template #list>
      <TfDeploymentList title="Discourse Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfDiscourse from "../weblets/tf_discourse.vue";

export default {
  name: "DiscourseView",
  components: {
    TfDeploymentList,
    TfDiscourse,
  },
  setup() {
    return { name: ProjectName.Discourse };
  },
};
</script>
