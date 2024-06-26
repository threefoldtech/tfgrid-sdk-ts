<template>
  <slot :props="props"></slot>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { usePasswordInput } from "../hooks";

const inputRef = ref();
const props = usePasswordInput({ ref: inputRef });

onMounted(() => {
  inputRef.value?.$el
    .querySelector(".v-field__append-inner")
    ?.querySelector("[class*='mdi-eye-']")
    ?.setAttribute("tabindex", "-1");
});
</script>

<script lang="ts">
export default {
  name: "PasswordInputWrapper",
};
</script>
