<template>
  <v-tooltip location="bottom" :text="light ? 'Switch to dark mode' : 'Switch to light mode'">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="anchor"
        :icon="light ? 'mdi-moon-waning-crescent' : 'mdi-brightness-4'"
        @click="changeTheme()"
      />
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useTheme } from "vuetify";

import { LocalStorageSettingsKey, updateThemeInLocalStorage } from "@/utils/settings";

const theme = useTheme();

const light = computed(() => {
  return theme.global.name.value === "light";
});

function setTheme(themeName: string) {
  theme.global.name.value = themeName;
  updateThemeInLocalStorage(themeName);
}

function changeTheme() {
  const newTheme = light.value ? "dark" : "light";
  setTheme(newTheme);
}

onMounted(() => {
  const storedTheme = localStorage.getItem(LocalStorageSettingsKey.THEME_KEY);
  if (storedTheme) {
    setTheme(storedTheme);
  }
});
</script>

<script lang="ts">
export default {
  name: "AppTheme",
};
</script>
