<template>
  <view-layout>
    <template #description
      >Presearch is a community-powered, decentralized search engine that provides better results while protecting your
      privacy and rewarding you when you search. This weblet deploys a Presearch node. Presearch Nodes are used to
      process user search requests, and node operators earn Presearch PRE tokens for joining and supporting the network.
      <a class="app-link" href="https://manual.grid.tf/weblets/weblets_presearch.html" target="_blank">
        read more about Presearch
      </a></template
    >

    <Presearch />

    <template #list>
      <TfDeploymentList title="Presearch Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Presearch from "../weblets/tf_presearch.vue";

export default {
  name: "PresearchView",
  components: {
    Presearch,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Presearch };
  },
};
</script>
