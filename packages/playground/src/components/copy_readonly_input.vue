<template>
  <copy-input-wrapper :data="data" #="{ props }">
    <v-textarea
      variant="outlined"
      :label="label"
      :model-value="data"
      v-bind="props"
      no-resize
      :rows="3"
      v-if="textarea"
    />
    <v-text-field variant="outlined" :label="label" :model-value="data" v-bind="props" v-else />
  </copy-input-wrapper>
</template>

<script lang="ts" setup>
defineProps<{ label: string; data: any; textarea?: boolean }>()
</script>

<script lang="ts">
export default {
  name: 'CopyReadonlyInput',
}
</script>
