<template>
  <view-layout>
    <template #description
      >Peertube aspires to be a decentralized and free/libre alternative to video broadcasting services.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_peertube.html" class="app-link">
        read more about Peertube
      </a></template
    >

    <TfPeertube />

    <template #list>
      <TfDeploymentList title="Peertube Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfPeertube from "../weblets/tf_peertube.vue";

export default {
  name: "PeertubeView",
  components: {
    TfPeertube,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Peertube };
  },
};
</script>
