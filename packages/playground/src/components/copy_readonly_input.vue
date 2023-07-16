<template>
  <copy-input-wrapper :data="data" :loading="loading" #="{ props }">
    <v-textarea
      variant="outlined"
      :label="label"
      :model-value="data"
      v-bind="props"
      no-resize
      :rows="3"
      :loading="loading"
      v-if="textarea"
    />
    <v-text-field variant="outlined" :label="label" :model-value="data" v-bind="props" :loading="loading" v-else />
  </copy-input-wrapper>
</template>

<script lang="ts" setup>
defineProps<{ label: string; data: any; textarea?: boolean; loading?: boolean }>();
</script>

<script lang="ts">
export default {
  name: "CopyReadonlyInput",
};
</script>
