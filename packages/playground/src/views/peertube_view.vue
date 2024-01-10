<template>
  <view-layout>
    <Tffunkwhale />

    <template #list>
      <TfDeploymentList title="funkwhale Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Tffunkwhale from "../weblets/tf_funkwhale.vue";

export default {
  name: "funkwhaleView",
  components: {
    Tffunkwhale,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.funkwhale };
  },
};
</script>
