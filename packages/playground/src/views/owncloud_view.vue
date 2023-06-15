<template>
  <view-layout>
    <template #description
      >Owncloud develops and provides open-source software for content collaboration, allowing teams to easily share and
      work on files seamlessly regardless of device or location.
      <a target="_blank" class="app-link" href="https://manual.grid.tf/weblets/weblets_owncloud.html">
        read more about OwnCloud
      </a></template
    >

    <TfOwncloud />

    <template #list>
      <TfDeploymentList :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfOwncloud from "../weblets/tf_owncloud.vue";

export default {
  name: "MattermostView",
  components: {
    TfOwncloud,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Owncloud };
  },
};
</script>
