<template>{{ parsedError }}</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";

function parseError(error?: string | undefined | null) {
  return [];
}

export default {
  name: "TfErrorFormater",
  props: {
    error: { type: String as PropType<string | undefined | null>, required: true },
  },
  setup(props) {
    const parsedError = computed(() => parseError(props.error));

    return { parsedError };
  },
};
</script>
