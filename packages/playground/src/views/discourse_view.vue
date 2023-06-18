<template>
  <view-layout>
    <template #description
      >Discourse is the 100% open source discussion platform built for the next decade of the Internet. Use it as a
      mailing list, discussion forum, long-form chat room, and more!
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_discourse.html" class="app-link">
        read more about Discourse
      </a></template
    >

    <TfDiscourse />

    <template #list>
      <TfDeploymentList title="Discourse Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfDiscourse from "../weblets/tf_discourse.vue";

export default {
  name: "DiscourseView",
  components: {
    TfDeploymentList,
    TfDiscourse,
  },
  setup() {
    return { name: ProjectName.Discourse };
  },
};
</script>
