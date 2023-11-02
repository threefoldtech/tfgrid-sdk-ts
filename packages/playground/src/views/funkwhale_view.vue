<template>
  <RouteToSolutions />
  <view-layout>
    <TfFunkwhale />

    <template #list>
      <TfDeploymentList title="Funkwhale Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfFunkwhale from "../weblets/tf_funkwhale.vue";

export default {
  name: "FunkwhaleView",
  components: {
    TfFunkwhale,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Funkwhale };
  },
};
</script>
