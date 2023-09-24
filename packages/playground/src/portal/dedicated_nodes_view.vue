<template>
  <div class="mt-8">
    <v-container>
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Node</v-card-title>
      </v-card>

      <v-card class="pa-3 my-4 white--text">
        <v-row class="pa-5 text-center">
          <button @click="toggleList">
            <div>
              <span>Filters</span>
              <span>&#9660;</span>
            </div>
          </button>
        </v-row>
      </v-card>

      <v-card class="pa-3 my-4 white--text" v-if="isExpanded">
        <v-row class="pa-5 text-center"> </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isExpanded = ref(false);

function toggleList() {
  isExpanded.value = !isExpanded.value;
}
</script>

<style></style>
