<template>
  <div :class="classes" role="alert">
    <p v-if="title" class="font-bold">{{ title }}</p>
    <p>
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { AlertType } from "../utils/types";

const props = defineProps({
  title: String,
  message: String,
  _type: String,
});

const classes = ref("");

const getAlertColor = (): string => {
  switch (props._type) {
    case AlertType.error:
      return "bg-red-100 border-l-4 border-red-500 text-red-700 container p-4 mx-auto";
    case AlertType.warning:
      return "bg-orange-100 border-l-4 border-orange-500 text-orange-700 container p-4 mx-auto";
  }
  return "orange";
};

onMounted(() => {
  classes.value = getAlertColor();
});
</script>

<script lang="ts">
export default {
  name: "CustomAlertComponent",
};
</script>
