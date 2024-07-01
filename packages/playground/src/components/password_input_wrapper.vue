<template :x="5">
  <slot :props="props"></slot>
</template>

<script lang="ts" setup>
import { usePasswordInput } from "../hooks";

const props = usePasswordInput();
</script>

<script lang="ts">
export default {
  name: "PasswordInputWrapper",
};
</script>
