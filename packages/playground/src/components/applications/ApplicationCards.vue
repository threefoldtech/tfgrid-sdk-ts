<template>
  <v-row>
    <v-col
      v-for="card in filteredCards"
      :key="card.title"
      cols="12"
      sm="12"
      md="12"
      lg="6"
      :xl="filteredCards.length > 3 ? 4 : 6"
    >
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
                <v-chip v-if="card.isNew" class="scale_beat ml-2 text-white" color="secondary"> New </v-chip>
              </v-card-title>
              <v-card-text class="mt-2" v-bind="props">
                {{ card.excerpt }}
              </v-card-text>
            </v-card>
          </template></v-hover
        >
      </router-link>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, ref } from "vue";

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
    const filteredCards = ref(props.cards);
    const createdAt = 1723471170046; // Update time now in milliseconds ex: 1723468996310 is 'Mon Aug 12 2024 16:23:16'

    onMounted(() => {
      const next30DaysInMs = 30 * 24 * 60 * 60 * 1000;
      const next30DaysFromNow = createdAt + next30DaysInMs;
      filteredCards.value.forEach(card => {
        if (card.isNew === true) {
          card.isNew = Date.now() < next30DaysFromNow;
        }
      });
    });
    return {
      baseURL,
      filteredCards,
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

.scale_beat {
  animation: crescendo 0.5s alternate infinite ease-in;
}

@keyframes crescendo {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
}
</style>
