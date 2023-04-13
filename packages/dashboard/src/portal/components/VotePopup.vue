<template>
  <v-dialog v-model="openProposalDialog" persistent max-width="350">
    <template v-slot:default="dialog">
      <v-card>
        <v-toolbar color="primary" dark dense elevation="4" outlined rounded>Vote now!</v-toolbar>
        <div class="d-flex align-center">
          <v-card-text>
            <div class="text-subtitle-1 text-center">{{ voteMsg }}</div>
          </v-card-text>
        </div>
        <v-card-actions class="justify-space-around">
          <v-btn text @click="dialog.value = false">Close</v-btn>
          <v-btn text @click="daoRedirect">Vote</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: "VotePopup",
})
export default class VotePopup extends Vue {
  openProposalDialog = false;
  proposals = 0;
  voteMsg = "You have a pending proposal to vote!";

  private __destroied = false;

  async mounted() {
    await this.$store.dispatch("portal/getProposal", this.$store.state.credentials.twin.id);

    this.proposals = this.$store.state.portal.proposals;

    if (!this.proposals || this.__destroied) return;

    this.voteMsg =
      this.proposals > 1
        ? `You have ${this.proposals} pending proposals to vote!`
        : `You have a pending proposal to vote!`;
    this.openProposalDialog = true;
  }

  daoRedirect() {
    this.openProposalDialog = false;
    this.$router.push({
      path: "account-dao",
    });
  }

  destroyed() {
    this.__destroied = true;
  }
}
</script>
