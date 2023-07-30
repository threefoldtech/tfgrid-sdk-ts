<template>
  <v-card color="transparent" flat tile>
    <v-carousel light show-arrows-on-hover cycle hide-delimiters height="fit-content" v-model="onboarding">
      <v-carousel-item v-for="(card, index) in cards" :key="`card-${index}`">
        <v-card flat color="transparent">
          <v-row align="center" justify="center">
            <v-card-text class="text-center" style="font-size: 2rem">
              <v-img width="750" style="margin: auto; margin-bottom: 20px" :src="card.img"> </v-img>
              <v-card-subtitle style="font-size: 1.5rem; padding: 5px">
                {{ card.text }}
              </v-card-subtitle>
              <v-btn
                v-if="card.button.toLowerCase().includes('capacity')"
                color="primary"
                x-large
                style="margin-top: 1.25rem"
                @click="redirectToExplorer()"
                v-bind:target="blank"
              >
                {{ card.button }}
              </v-btn>
              <v-btn
                v-else
                color="primary"
                x-large
                style="margin-top: 1.25rem"
                v-bind:href="card.link"
                v-bind:target="blank"
              >
                {{ card.button }}
              </v-btn>
            </v-card-text>
          </v-row>
        </v-card>
      </v-carousel-item>
    </v-carousel>
  </v-card>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

interface WelcomeCard {
  text: string;
  button: string;
  img: string;
  link: string;
}

@Component({
  name: "WelcomeWindow",
})
export default class WelcomeWindow extends Vue {
  onboarding = 0;
  blank = "blank";
  cards: WelcomeCard[] = [
    {
      text: "Discover the ThreeFold Grid",
      button: "View ThreeFold Capacity ",
      link: "https://explorer.dev.grid.tf/",
      img: require("../../assets/map.png"),
    },
    {
      text: "Your Guide to The ThreeFold Grid",
      button: "Learn More",
      link: "https://manual.grid.tf/getstarted/tfgrid3_getstarted.html",
      img: require("../../assets/guide_to_gride.png"),
    },
  ];

  public next() {
    this.onboarding = this.onboarding + 1 === this.cards.length ? 0 : this.onboarding + 1;
  }
  public prev() {
    this.onboarding = this.onboarding - 1 < 0 ? this.cards.length - 1 : this.onboarding - 1;
  }
  redirectToExplorer() {
    this.$router.push({
      path: "/explorer/statistics",
    });
  }
}
</script>
<style>
.v-window__prev,
.v-window__next {
  background: transparent !important;
}
</style>
