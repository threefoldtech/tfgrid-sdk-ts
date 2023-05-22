<template>
  <div>
    <TfFunkwhale />

    <div class="mt-4">
      <TfDeploymentList :project-name="name" />
    </div>
  </div>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfFunkwhale from "../weblets/tf_funkwhale.vue";

export default {
  name: "FunkwhaleView",
  components: {
    TfFunkwhale,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Funkwhale };
  },
};
</script>
