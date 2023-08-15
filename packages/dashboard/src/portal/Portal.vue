<template>
  <v-container>
    <router-view style="padding: 3%; margin: 4% 0" />
    <VotePopup v-if="$store.state.credentials.twin.id && farmNodes" />
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import VotePopup from "./components/VotePopup.vue";

@Component({
  name: "PortalView",
  components: {
    VotePopup,
  },
})
export default class PortalView extends Vue {
  farmNodes = [];
  mounted() {
    this.farmNodes = this.$store.getters["portal/getFarmNodes"];
    console.log("farmnodes", this.farmNodes);
  }
}
</script>
