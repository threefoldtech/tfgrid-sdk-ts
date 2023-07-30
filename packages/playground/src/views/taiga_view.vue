<template>
  <view-layout>
    <TfTaiga />

    <template #list>
      <TfDeploymentList title="Taiga Instances" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import TfTaiga from "../weblets/tf_taiga.vue";

export default {
  name: "TaigaView",
  components: {
    TfTaiga,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.Taiga };
  },
};
</script>
