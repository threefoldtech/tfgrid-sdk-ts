<template>
  <router-link to="/solutions">
    <v-btn prepend-icon="mdi-arrow-left" variant="text" color="secondary">
      <template v-slot:prepend>
        <v-icon color="secondary"></v-icon>
      </template>
      Back
    </v-btn>
  </router-link>
</template>

<script lang="ts">
export default {
  name: "RouteToSolutions",
};
</script>
