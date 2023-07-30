<template>
  <view-layout>
    <TFWordpress />

    <template #list>
      <TfDeploymentList title="WordPress Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TFWordpress from "../weblets/tf_wordpress.vue";

export default {
  name: "WordpressView",
  components: {
    TFWordpress,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Wordpress };
  },
};
</script>
