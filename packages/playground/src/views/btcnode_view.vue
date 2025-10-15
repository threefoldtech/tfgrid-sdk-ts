<template>
  <view-layout>
    <BTCNode />

    <template #list>
      <TfDeploymentList title="BTC Node" :project-name="name" />
    </template>
  </view-layout>
</template>

<script lang="ts">
import { ProjectName } from "../types";
import TfDeploymentList from "../weblets/tf_deployment_list.vue";
import BTCNode from "../weblets/tf_btcnode.vue";

export default {
  name: "BTCNodeView",
  components: {
    BTCNode,
    TfDeploymentList,
  },
  setup() {
    return { name: ProjectName.BTCNode };
  },
};
</script>
