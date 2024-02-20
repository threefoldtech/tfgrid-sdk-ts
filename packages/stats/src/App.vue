<script setup lang="ts">
import StatisticsView from "./views/statistics.vue";
</script>

<template>
  <main>
    <v-app full-height>
      <v-sheet color="title" class="w-100 d-flex align-center justify-center">
        <v-icon class="mr-1" size="large" icon="mdi-chart-scatter-plot"> </v-icon>
        <p class="my-2 font-weight-bold text-h6">Statistics</p>
      </v-sheet>
      <StatisticsView />
      <v-footer color="black" class="pa-0 mt-2 d-flex flex-column">
        <div class="my-auto bg-black text-center w-100">
          {{ new Date().getFullYear() }} — <strong>ThreeFoldTech</strong>
        </div>
      </v-footer>
    </v-app>
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
