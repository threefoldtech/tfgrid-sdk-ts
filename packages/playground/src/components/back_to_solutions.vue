<template>
  <div>
    <router-link v-if="showBackButton" :to="backButtonDestination">
      <v-btn prepend-icon="mdi-arrow-left" variant="text" color="secondary">Back</v-btn>
    </router-link>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RouteToSolutions",
  computed: {
    showBackButton() {
      return this.$route.path !== "/solutions";
    },
    backButtonDestination() {
      return "/solutions";
    },
  },
});
</script>
