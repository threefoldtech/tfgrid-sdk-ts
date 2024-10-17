<template>
  <v-tooltip location="bottom" :text="light ? 'Switch to dark mode' : 'Switch to light mode'">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="anchor"
        @click="light = !light"
        :icon="light ? 'mdi-moon-waning-crescent' : 'mdi-brightness-4'"
      />
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useTheme } from "vuetify";

import { LocalStorageSettingsKey } from "@/utils/settings";

const theme = useTheme();
const light = ref(false);

watch(light, light => (theme.global.name.value = light ? "light" : "dark"));
watch(theme.global.name, theme => {
  const formattedThemeName = `${theme} mode`;
  localStorage.setItem(LocalStorageSettingsKey.THEME_KEY, formattedThemeName);
  light.value = theme === "light";
});
</script>

<script lang="ts">
export default {
  name: "AppTheme",
};
</script>
