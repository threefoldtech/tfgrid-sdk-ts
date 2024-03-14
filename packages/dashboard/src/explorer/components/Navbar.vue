<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon>
      <v-btn icon @click="$emit('toggle-sidenav')">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar-nav-icon>
    <v-app-bar-title>
      <span class="app-title"> TF Explorer </span>
    </v-app-bar-title>
    <v-spacer />
    <template v-if="$store.getters['explorer/loading']">
      <v-progress-circular indeterminate />
      <v-divider vertical class="mr-4 ml-4" />
    </template>
    <v-btn icon @click="toggleTheme">
      <v-icon>mdi-theme-light-dark</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class Navbar extends Vue {
  private get dark(): boolean {
    return this.$vuetify.theme.dark;
  }

  private set dark(value: boolean) {
    this.$vuetify.theme.dark = value;
  }

  created(): void {
    const theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    this.dark = theme === "dark";
  }

  toggleTheme(): void {
    const theme = this.dark ? "light" : "dark";
    localStorage.setItem("theme", theme);
    this.dark = !this.dark;
  }
}
</script>

<style scoped>
.app-title {
  color: white;
  font-weight: 500;
}
</style>
