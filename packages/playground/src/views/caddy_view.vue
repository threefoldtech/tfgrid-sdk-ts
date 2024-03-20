<template>
  <view-layout>
    {{ name }}
    <Caddy />

    <template #list>
      <TfDeploymentList title="Caddy Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import Caddy from "../weblets/tf_caddy.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "CaddyView",
  components: {
    Caddy,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Caddy };
  },
};
</script>
