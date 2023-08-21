<template>
  <view-layout>
    <TfNextcloud />

    <template #list>
      <TfDeploymentList title="Nextcloud Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfNextcloud from "../weblets/tf_nextcloud.vue";

export default {
  name: "NextcloudView",
  components: {
    TfNextcloud,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Nextcloud };
  },
};
</script>