<template>
  <v-tooltip :text="tooltip" location="bottom">
    <template #activator="{ props }">
      <v-btn
        :color="color"
        v-bind="props"
        :href="href"
        :target="href ? '_blank' : undefined"
        variant="tonal"
        :height="height"
        class="my-1 mr-1"
        :disabled="disabled"
        @click.stop="$emit('click', $event)"
      >
        <v-icon> {{ icon }}</v-icon>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
defineProps<{
  tooltip: string;
  icon: `mdi-${string}`;
  color?: string;
  href?: string;
  height?: string;
  disabled?: boolean;
}>();
defineEmits(["click"]);
</script>

<script lang="ts">
export default {
  name: "IconActionBtn",
};
</script>
