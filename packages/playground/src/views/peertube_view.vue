<template>
  <RouteToSolutions />
  <view-layout>
    <TfPeertube />

    <template #list>
      <TfDeploymentList title="Peertube Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfPeertube from "../weblets/tf_peertube.vue";

export default {
  name: "PeertubeView",
  components: {
    TfPeertube,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Peertube };
  },
};
</script>
