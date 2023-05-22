<template>
  <div>
    <TfPeertube />

    <div class="mt-4">
      <TfDeploymentList :project-name="name" />
    </div>
  </div>
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
