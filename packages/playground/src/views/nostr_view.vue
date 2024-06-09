<template>
  <view-layout>
    <Nostr />

    <template #list>
      <TfDeploymentList title="Nostr" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import Nostr from "../weblets/tf_nostr.vue";

export default {
  name: "TFRobotView",
  components: {
    Nostr,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Nostr };
  },
};
</script>
