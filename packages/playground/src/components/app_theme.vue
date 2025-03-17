<template>
  <v-tooltip location="bottom" :text="light ? 'Switch to dark mode' : 'Switch to light mode'">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="anchor"
        @click="changeTheme()"
        :icon="light ? 'mdi-moon-waning-crescent' : 'mdi-brightness-4'"
      />
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

import { LocalStorageSettingsKey } from "@/utils/settings";

const theme = useTheme();

const light = computed(() => {
  return theme.global.name.value == "light";
});
function changeTheme() {
  theme.global.name.value == "dark" ? (theme.global.name.value = "light") : (theme.global.name.value = "dark");
  localStorage.setItem(LocalStorageSettingsKey.THEME_KEY, theme.global.name.value);
}
</script>

<script lang="ts">
export default {
  name: "AppTheme",
};
</script>
