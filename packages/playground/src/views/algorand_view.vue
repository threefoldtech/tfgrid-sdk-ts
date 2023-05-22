<template>
  <div>
    <TfAlgorand />

    <div class="mt-4">
      <TfDeploymentList :project-name="name" />
    </div>
  </div>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfAlgorand from "../weblets/tf_algorand.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "AlgorandView",
  components: {
    TfAlgorand,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Algorand };
  },
};
</script>
