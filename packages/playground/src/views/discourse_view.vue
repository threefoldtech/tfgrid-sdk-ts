<template>
  <RouteToSolutions />
  <view-layout>
    <TfDiscourse />

    <template #list>
      <TfDeploymentList title="Discourse Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfDiscourse from "../weblets/tf_discourse.vue";

export default {
  name: "DiscourseView",
  components: {
    TfDeploymentList,
    TfDiscourse,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Discourse };
  },
};
</script>
