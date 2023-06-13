<template>
  <v-tooltip location="bottom" :text="light ? 'Switch to dark mode' : 'Switch to light mode'">
    <template #activator="{ props }">
      <v-btn v-bind="props" @click="light = !light" :icon="light ? 'mdi-moon-waning-crescent' : 'mdi-brightness-4'" />
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const light = ref(false);

const KEY = "APP_CURRENT_THEME";

watch(light, light => (theme.global.name.value = light ? "light" : "dark"));
watch(theme.global.name, theme => localStorage.setItem(KEY, theme));
onMounted(() => {
  const theme = localStorage.getItem("APP_CURRENT_THEME");
  light.value = theme === "light";
});
</script>

<script lang="ts">
export default {
  name: "AppTheme",
};
</script>
