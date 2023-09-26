<template>
  <div class="pt-5">
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab :value="0" color="primary" class="pr-8">Rentable</v-tab>
        <v-tab :value="1" color="primary" class="pr-8">Rented</v-tab>
        <v-tab :value="2" color="primary" class="pr-8">Mine</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item :value="0"> </v-window-item>

        <v-window-item :value="1"> </v-window-item>

        <v-window-item :value="2"> </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const activeTab = ref(0);
</script>
