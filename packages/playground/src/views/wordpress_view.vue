<template>
  <view-layout>
    <template #description
      >WordPress is the simplest, most popular way to create your own website or blog. In fact, WordPress powers over
      43.3% of all the websites on the Internet.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_wordpress.html" class="app-link">
        read more about Wordpress
      </a></template
    >
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
