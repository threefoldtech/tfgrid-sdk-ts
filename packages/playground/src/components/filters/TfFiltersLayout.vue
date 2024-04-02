<template>
  <div class="d-flex">
    <div :style="{ width }">
      <slot name="filters" />
    </div>
    <div :style="{ marginLeft: '16px', width: `calc(100% - 16px - ${width})` }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
const WIDTH_SIZE = 320;

export default {
  name: "TfFiltersLayout",
  setup() {
    return { width: WIDTH_SIZE + "px" };
  },
};
</script>
