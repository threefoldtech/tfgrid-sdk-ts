<template>
  <v-row>
    <v-col v-for="card in cards" :key="card.title" cols="12" sm="12" md="12" lg="6" :xl="cards.length > 3 ? 4 : 6">
      <router-link :to="card.route">
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-card :height="200" class="pa-3 pt-6" v-bind="props" :class="isHovering ? 'card-opacity' : undefined">
              <v-img
                class="d-inline-block ml-3 mb-2"
                width="35"
                :src="baseURL + 'images/icons/' + card.icon"
                :alt="card.title"
                :style="{
                  filter: `brightness(${$vuetify.theme.global.name === 'light' ? 0.2 : 1})`,
                  lineHeight: 1,
                }"
              />
              <v-card-title class="d-inline-block">
                {{ card.title }}
                <v-chip v-for="tag in card.tags" :key="tag" class="ml-2 pulse-animation">
                  {{ tag }}
                </v-chip>
              </v-card-title>
              <v-card-text class="mt-2" v-bind="props"> {{ card.excerpt }} </v-card-text>
            </v-card>
          </template></v-hover
        >
      </router-link>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

import type { ApplicationCard } from "@/utils/types";

export default defineComponent({
  name: "ApplicationCards",
  props: {
    cards: {
      type: Object as PropType<ApplicationCard[]>,
      required: true,
    },
  },
  setup() {
    const baseURL = import.meta.env.BASE_URL;
    return {
      baseURL,
    };
  },
});
</script>

<style scoped>
a {
  text-decoration: none !important;
}

.card-opacity {
  background-color: rgba(125, 227, 200, 0.12);
}
</style>
