<template>
  <div>
    <TfUmbrel />

    <div class="mt-4">
      <TfDeploymentList title="Umbrel Instances" :project-name="name" />
    </div>
  </div>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfUmbrel from "../weblets/tf_umbrel.vue";

export default {
  name: "UmbrelView",
  components: {
    TfUmbrel,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Umbrel };
  },
};
</script>
