<template>
  <RouteToSolutions />
  <view-layout>
    <TfUmbrel />

    <template #list>
      <TfDeploymentList title="Umbrel Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import RouteToSolutions from "../components/back_to_solutions.vue";
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfUmbrel from "../weblets/tf_umbrel.vue";

export default {
  name: "UmbrelView",
  components: {
    TfUmbrel,
    TfDeploymentList,
    RouteToSolutions,
  },
  setup() {
    return { name: ProjectName.Umbrel };
  },
};
</script>
