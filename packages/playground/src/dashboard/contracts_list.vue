<template>
  <view-layout>
    <template #description>Details about your owned contracts</template>

    <TfContractsList />
  </view-layout>
</template>

<script lang="ts">
import TfContractsList from "../weblets/tf_contracts_list.vue";

export default {
  name: "ContractsList",
  components: {
    TfContractsList,
  },
};
</script>
