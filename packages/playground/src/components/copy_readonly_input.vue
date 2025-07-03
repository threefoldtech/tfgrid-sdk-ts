<template>
  <copy-input-wrapper :data="data" :loading="loading" #="{ props }">
    <v-textarea
      v-if="textarea"
      class="copy-input-wrapper"
      readonly
      variant="outlined"
      :label="label"
      :model-value="data"
      v-bind="props"
      no-resize
      :rows="3"
      :loading="loading"
      :hint="hint"
      :persistent-hint="!!hint"
    />
    <v-text-field
      v-else
      class="copy-input-wrapper"
      variant="outlined"
      readonly
      :label="label"
      :model-value="data"
      v-bind="props"
      :loading="loading"
      :hint="hint"
      :persistent-hint="!!hint"
    />
  </copy-input-wrapper>
</template>

<script lang="ts" setup>
defineProps<{ label: string; data: any; textarea?: boolean; loading?: boolean; hint?: string }>();
</script>

<script lang="ts">
export default {
  name: "CopyReadonlyInput",
};
</script>
