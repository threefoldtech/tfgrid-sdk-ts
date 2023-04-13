<template>
  <v-card color="transparent" flat tile>
    <v-window v-model="onboarding">
      <v-window-item v-for="(card, index) in cards" :key="`card-${index}`">
        <v-card color="transparent">
          <v-row class="fill-height" align="center" justify="center">
            <v-card-text class="text-center" style="font-size: 2rem">
              <v-img width="450" style="margin: auto; margin-bottom: 20px" :src="card.img"> </v-img>
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
      </v-window-item>
    </v-window>

    <v-card-actions class="justify-space-between">
      <v-btn text @click="prev">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-item-group v-model="onboarding" class="text-center" mandatory>
        <v-item v-for="n in cards.length" :key="`btn-${n}`" v-slot="{ active, toggle }">
          <v-btn :input-value="active" icon @click="toggle">
            <v-icon>mdi-record</v-icon>
          </v-btn>
        </v-item>
      </v-item-group>
      <v-btn text @click="next">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-actions>
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
      text: "The Decentralized Cloud Awaits!",
      button: "Download polkadot{.js} extension to access the Portal",
      link: "https://polkadot.js.org/extension/",
      img: require("../../assets/decentralized.png"),
    },
    {
      text: "Discover the ThreeFold Grid",
      button: "View ThreeFold Capacity ",
      link: "https://explorer.dev.grid.tf/",
      img: require("../../assets/map.png"),
    },
    {
      text: "Your Guide to The ThreeFold Grid",
      button: "Learn More",
      link: "https://library.threefold.me/info/manual/#/",
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
