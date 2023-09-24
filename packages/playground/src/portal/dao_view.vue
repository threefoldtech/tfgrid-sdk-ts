<template>
  <v-container fluid>
    <v-card color="primary" class="my-3 pa-3 text-center">
      <v-icon width="26">mdi-note-check-outline</v-icon>
      <h2>DAO</h2>
    </v-card>

    <v-skeleton-loader :loading="loadingProposals" max-width="100%" type="image">
      <v-container v-if="proposals?.active?.length == 0 && proposals?.inactive?.length == 0">
        <v-card class="my-3 pa-3 d-flex justify-center">
          <h3>No proposals at this time</h3>
        </v-card>
      </v-container>
      <v-container v-else>
        <v-card>
          <h4 class="d-flex justify-center pa-4">
            User, you can now vote on proposals!
            <v-icon @click="openInfoModal = true"> mdi-information-outline </v-icon>
          </h4>
          <v-tabs v-model="activeTab" align-tabs="center">
            <v-tab color="primary" v-for="(tab, index) in tabs" :key="index" :value="`${index}`">{{ tab.title }}</v-tab>
          </v-tabs>
        </v-card>
        <v-window v-model="activeTab">
          <!--Active-->
          <v-window-item v-for="(tab, index) in tabs" :key="index" :value="`${index}`">
            <v-card>
              <v-text-field
                v-model="searchTerm"
                color="primary darken-2"
                label="Search by proposal action or description"
                class="pa-3"
              ></v-text-field>
            </v-card>
            <v-card class="my-3 pa-3" v-for="(proposal, i) in tab.content.value" :key="i">
              <v-card-title class="pa-3 mb-2">
                {{ proposal.action.toUpperCase() }}
              </v-card-title>
              <v-card-subtitle class="pb-0">
                <p class="font-weight-bold">
                  Proposal hash: <span class="text--secondary">{{ proposal.hash }}</span>
                </p>
              </v-card-subtitle>
              <v-card-text class="pb-0">
                <p class="font-weight-bold">
                  Description:
                  <span class="text--secondary">
                    {{ proposal.description }}
                    <a v-bind:href="proposal.link" v-bind:target="'blank'">More details</a>
                  </span>
                </p>
                <p class="font-weight-bold" v-if="expired(proposal.end)">
                  You can vote until:
                  <span class="text--secondary">{{ proposal.end }}</span>
                </p>
                <p class="font-weight-bold" v-else>
                  Voting ended on: <span class="text--secondary">{{ proposal.end }}</span>
                </p>
              </v-card-text>
              <v-container class="votes">
                <div v-if="expired(proposal.end)" class="d-flex justify-space-between my-3 mx-8">
                  <v-btn color="primary" @click="openVoteDialog(proposal.hash, true)" :disabled="loadingVote"
                    >Yes <v-divider class="mx-3" vertical />{{ proposal.ayes.length }}
                  </v-btn>
                  <div class="d-flex align-center text-center pr-2">
                    <v-divider vertical />
                    <span class="px-1"
                      >Threshold: <br />{{ proposal.nayes.length + proposal.ayes.length }}/{{ proposal.threshold }}
                    </span>
                    <v-divider vertical />
                  </div>
                  <v-btn
                    color="grey lighten-2 black--text"
                    @click="openVoteDialog(proposal.hash, false)"
                    :disabled="loadingVote"
                    >No <v-divider class="mx-3" vertical />{{ proposal.nayes.length }}
                  </v-btn>
                </div>
              </v-container>
            </v-card>
          </v-window-item>
        </v-window>
        <v-dialog v-model="openInfoModal" width="50vw">
          <v-card class="card">
            <v-card-title class="text-h5"> Proposals information </v-card-title>

            <v-card-text>
              <div class="textContainer">
                <h2>General</h2>
                <span>A proposal can be created by one of the council members of tfchain.</span>
                <span> Once a proposal has reached it's timelimit, voting stops and a proposal can be closed.</span>
                <span>
                  A proposal is either approved or dissapproved based on the majority of the weights of yes / no votes
                  (50%).</span
                >
                <span>
                  A minimal participation threshold must be met. If there are not enough votes and the timelimit is
                  reached, the proposal is dissapproved.</span
                >
                <br />
                <h2>How do we count weight:</h2>
                <span
                  >Votes are weighted based on the farmers stake in the network. One vote by default is 1 weight.</span
                >
                <span> If the farmers has nodes, the weight of the vote is calulcated as following:</span>
                <ul>
                  <li>Sum of all nodes of the farmer: (node CU * 2 + node SU)</li>
                </ul>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="openInfoModal = false"> Close </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-skeleton-loader>
  </v-container>
</template>
<script lang="ts" setup>
import type { Proposal, Proposals } from "@threefold/tfchain_client";
import type moment from "moment";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid } from "../utils/grid";

const loadingProposals = ref(true);
const activeTab = ref(0);
const activeProposals = ref<Proposal[]>();
const inactiveProposals = ref<Proposal[]>();
const proposals = ref<Proposals>();
const searchTerm = ref("");
const openInfoModal = ref(false);
const openVDialog = ref(false);
const castedVote = ref(false);
const loadingVote = ref(false);

const selectedProposal = ref("");
const profileManager = useProfileManager();
const profile = ref(profileManager.profile!);
const tabs = [
  { title: "Active", content: activeProposals },
  { title: "Executable", content: inactiveProposals },
];

onMounted(async () => {
  const grid = await getGrid(profile.value);
  proposals.value = await grid?.dao.get();
  activeProposals.value = proposals?.value?.active;
});
function expired(proposalEnd: moment.Moment) {
  return proposalEnd.isAfter(Date.now());
}
function openVoteDialog(hash: any, vote: boolean) {
  openVDialog.value = true;
  castedVote.value = vote;
  selectedProposal.value = hash;
}
</script>
