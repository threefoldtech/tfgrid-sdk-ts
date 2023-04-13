<template>
  <v-container>
    <router-view style="padding: 6% 5% 5% 10%; margin: 4% 0" />
    <VotePopup v-if="$store.state.credentials.twin.id" />
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
export default class PortalView extends Vue {}
</script>
