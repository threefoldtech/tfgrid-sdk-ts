<script setup lang="ts">
import StatisticsView from "./views/statistics.vue";
</script>

<template>
  <header>
    <v-sheet color="title" class="w-100 d-flex align-center justify-center">
      <v-icon class="mr-1" size="large" icon="mdi-chart-scatter-plot"> </v-icon>
      <p class="my-2 font-weight-bold text-h6">Statistics</p>
    </v-sheet>
  </header>

  <main>
    <StatisticsView />
    <v-sheet style="position: relative; bottom: 0%" class="w-100 d-flex align-center justify-center">
      <p class="my-1 font-weight-bold">{{ new Date().getFullYear() }} - ThreeFoldTech</p>
    </v-sheet>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
