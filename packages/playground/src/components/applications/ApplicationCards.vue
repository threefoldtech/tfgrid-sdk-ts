<template>
  <v-row>
    <v-col v-for="card in cards" :key="card.title" cols="12" sm="12" md="6" lg="6">
      <router-link :to="card.route">
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-card
              class="pa-3 pt-6"
              :height="isMobile && tallestCard > 220 ? 220 : 200"
              v-bind="props"
              :class="isHovering ? 'card-opacity' : undefined"
            >
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
                <v-chip v-if="card.flare" class="ml-2 pulse-animation"> Community </v-chip>
              </v-card-title>
              <v-card-text class="mt-2"> {{ card.excerpt }} </v-card-text>
            </v-card>
          </template></v-hover
        >
      </router-link>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref } from "vue";
import { useDisplay } from "vuetify";

import type { ApplicationCard } from "@/utils/types";

export default defineComponent({
  name: "ApplicationCards",
  props: {
    cards: {
      type: Object as PropType<ApplicationCard[]>,
      required: true,
    },
  },
  setup(props) {
    const baseURL = import.meta.env.BASE_URL;
    const tallestCard = ref(0);
    const isMobile = useDisplay().mobile;

    props.cards.forEach(card => {
      if (card.excerpt.length > tallestCard.value) {
        tallestCard.value = card.excerpt.length;
      }
    });

    return {
      baseURL,
      tallestCard,
      isMobile,
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
