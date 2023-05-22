<template>
  <div>
    <TfCaprover />

    <div class="mt-4">
      <TfDeploymentList :project-name="name" />
    </div>
  </div>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfCaprover from "../weblets/tf_caprover.vue";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";

export default {
  name: "CaproverView",
  components: {
    TfCaprover,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Caprover };
  },
};
</script>
