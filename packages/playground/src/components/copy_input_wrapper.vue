<template>
  <slot
    :props="{
      'append-inner-icon': 'mdi-content-copy',
      'onClick:append-inner': copy,
    }"
  ></slot>
</template>

<script lang="ts" setup>
import { createCustomToast, ToastType } from "@/utils/custom_toast";

const props = defineProps({ data: String });

function copy() {
  navigator.clipboard.writeText(props.data || "");
  createCustomToast("Copied!", ToastType.success);
}
</script>

<script lang="ts">
export default {
  name: "CopyInputWrapper",
};
</script>
