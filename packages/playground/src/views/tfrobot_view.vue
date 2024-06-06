<template>
  <view-layout>
    <TFRobot />

    <template #list>
      <TfDeploymentList title="TFRobot" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TFRobot from "../weblets/tfrobot.vue";

export default {
  name: "TFRobotView",
  components: {
    TFRobot,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.TFRobot };
  },
};
</script>
