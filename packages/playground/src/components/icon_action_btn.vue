<template>
  <v-tooltip :text="tooltip" location="bottom">
    <template #activator="{ props }">
      <v-btn
        @click.stop="$emit('click', $event)"
        :color="color"
        v-bind="props"
        :href="href"
        :target="href ? '_blank' : undefined"
        variant="tonal"
        :height="height"
        class="my-1 mr-1"
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
}>();
defineEmits(["click"]);
</script>

<script lang="ts">
export default {
  name: "IconActionBtn",
};
</script>
