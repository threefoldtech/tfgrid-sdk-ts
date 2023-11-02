<template>
  <RouteToSolutions />
  <view-layout>
    <Presearch />

    <template #list>
      <TfDeploymentList title="Presearch Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Presearch from "../weblets/tf_presearch.vue";

export default {
  name: "PresearchView",
  components: {
    Presearch,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Presearch };
  },
};
</script>
