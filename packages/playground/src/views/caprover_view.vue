<template>
  <RouteToSolutions />
  <view-layout>
    <TfCaprover />

    <template #list>
      <TfDeploymentList title="CapRover Clusters" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfCaprover from "../weblets/tf_caprover.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "CaproverView",
  components: {
    TfCaprover,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Caprover };
  },
};
</script>
