<template>
  <slot name="search-support" :searchSupportProps="props"></slot>
</template>

<script lang="ts">
export default {
  name: "TfSelectFarmSupportSearch",
  setup() {
    return {
      props: {
        "onUpdate:focused"() {
          console.log("here?");
        },
      },
    };
  },
};
</script>
