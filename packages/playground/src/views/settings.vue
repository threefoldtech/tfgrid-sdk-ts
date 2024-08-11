<template>
  <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
    <v-icon size="30" class="pr-3">mdi-cog</v-icon>
    <v-card-title class="pa-0">Settings</v-card-title>
  </v-card>
  <v-card class="my-5"
    ><v-card-title>Theme</v-card-title> <v-card-text>Pick an application theme!</v-card-text>
    <v-select class="pa-3" :items="themes" v-model="selectedTheme" />
    <v-card-actions class="justify-end">
      <v-btn @click="UpdateTheme" class="justify-end ml-auto">Update</v-btn></v-card-actions
    >
  </v-card>
</template>
<script lang="ts">
import { ref, watch } from "vue";
import { useTheme } from "vuetify";
export default {
  name: "Settings",
  setup() {
    const theme = useTheme();
    const KEY = "APP_CURRENT_THEME";

    const themes = ["Dark Mode", "Light Mode"];

    const currentTheme = localStorage.getItem(KEY);

    watch(theme.global.name, theme => localStorage.setItem(KEY, theme));

    const selectedTheme = ref(currentTheme == "light" ? "Light Mode" : "Dark Mode");

    function UpdateTheme() {
      console.log(currentTheme);
      console.log(selectedTheme.value);
      if (selectedTheme.value.split(" ")[0].toLowerCase() != currentTheme) {
        localStorage.setItem(KEY, selectedTheme.value == "Light Mode" ? "light" : "dark");
        theme.global.name.value = selectedTheme.value == "Light Mode" ? "light" : "dark";
      }
    }

    return {
      themes,
      selectedTheme,
      UpdateTheme,
    };
  },
};
</script>
