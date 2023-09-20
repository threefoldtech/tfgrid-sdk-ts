<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import "./index.css";

import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
