<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-note-check-outline</v-icon>
      <v-card-title class="pa-0">DAO</v-card-title>
    </v-card>
    <div class="d-flex my-12 align-center justify-center" v-if="loadingProposals">
      <v-progress-circular :size="70" :width="7" indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="proposals?.active?.length == 0 && proposals?.inactive?.length == 0">
      <v-card class="my-3 pa-3 d-flex justify-center">
        <h3>No proposals at this time</h3>
      </v-card>
    </div>
    <div v-else>
      <v-card>
        <h4 class="d-flex justify-center pa-4">
          User, you can now vote on proposals!
          <v-icon @click="openInfoModal = true" class="mx-3"> mdi-information-outline </v-icon>
        </h4>
        <v-tabs v-model="activeTab" align-tabs="center">
          <v-tab color="secondary" v-for="(tab, index) in tabs" :key="index" :value="`${index}`">{{ tab.title }}</v-tab>
        </v-tabs>
      </v-card>
      <v-window v-model="activeTab">
        <!--Active-->
        <v-window-item v-for="(tab, index) in tabs" :key="index" :value="`${index}`">
          <v-card>
            <v-text-field
              v-model="searchTerm"
              variant="underlined"
              label="Search by proposal description"
              class="pa-5"
            ></v-text-field>
          </v-card>

          <v-card class="my-3 pa-5" v-for="(proposal, i) in filteredProposals(tab.content.value)" :key="i">
            <v-card-title class="pa-0 mb-5" v-if="proposal.action">
              {{ proposal.action }}
            </v-card-title>
            <!-- <v-card-subtitle class="pb-0">
              <p class="font-weight-bold">
                Proposal hash: <span class="text--secondary">{{ proposal.hash }}</span>
              </p>
            </v-card-subtitle> -->
            <v-card-text class="pb-0">
              <v-row>
                <p class="font-weight-medium mr-3">Description:</p>
                <span class="text--secondary">
                  {{ proposal.description }}
                  <a v-bind:href="proposal.link" v-bind:target="'blank'">More details</a>
                </span>
              </v-row>
              <v-row v-if="expired(proposal.end)">
                <p class="font-weight-medium mr-3">You can vote until:</p>
                <span class="text--secondary">{{ proposal.end }}</span>
              </v-row>
              <v-row v-else>
                <p class="font-weight-medium mr-3">Voting ended on:</p>
                <span class="text--secondary">{{ proposal.end }}</span>
              </v-row>
            </v-card-text>
            <v-row class="my-3">
              <v-col class="votes">
                <v-container class="" :style="{}">
                  <v-row v-if="expired(proposal.end)" class="d-flex justify-space-between">
                    <v-btn
                      :style="{ backgroundColor: '#1AA18F' }"
                      @click="openVoteDialog(proposal.hash, true)"
                      :disabled="loadingVote"
                      class="text-white"
                      >Yes <v-divider class="mx-3" vertical />{{ proposal.ayes.length }}
                    </v-btn>
                    <div class="d-flex align-center text-center pr-2">
                      <span class="px-1"
                        >Threshold: {{ proposal.nayes.length + proposal.ayes.length }}/{{ proposal.threshold }}
                      </span>
                    </div>
                    <v-btn
                      color="grey lighten-2 text-black"
                      @click="openVoteDialog(proposal.hash, false)"
                      :disabled="loadingVote"
                      >No <v-divider class="mx-3" vertical />{{ proposal.nayes.length }}
                    </v-btn>
                  </v-row>
                </v-container>
                <v-container :style="{ width: '100%' }" v-if="proposal.ayesProgress > 0 || proposal.nayesProgress > 0">
                  <v-row v-if="expired(proposal.end)" class="">
                    <div :style="{ width: `${proposal.ayesProgress}%` }">
                      <v-progress-linear
                        :height="24"
                        color="primary"
                        v-model="proposal.ayesProgress"
                        :style="{
                          backgroundColor: '#1AA18F',
                          marginRight: 'auto',
                        }"
                      >
                        <span class=""
                          >{{
                            !!(proposal.ayesProgress % 1) ? proposal.ayesProgress.toFixed(2) : proposal.ayesProgress
                          }}%</span
                        >
                      </v-progress-linear>
                    </div>
                    <div :style="{ width: `${proposal.nayesProgress}%` }">
                      <v-progress-linear
                        :height="24"
                        color="#9e9e9e"
                        v-model="proposal.nayesProgress"
                        :style="{
                          backgroundColor: '#9e9e9e',
                          marginRight: 'auto',
                        }"
                      >
                        <v-row class="d-flex justify-center">
                          <span class="text-black"
                            >{{
                              !!(proposal.nayesProgress % 1)
                                ? proposal.nayesProgress.toFixed(2)
                                : proposal.nayesProgress
                            }}%</span
                          >
                        </v-row>
                      </v-progress-linear>
                    </div>
                  </v-row>
                  <v-row v-else justify="center" class="">
                    <v-progress-linear
                      v-if="proposal.ayesProgress > proposal.nayesProgress"
                      rounded
                      v-model="proposal.ayesProgress"
                      color="primary"
                      height="24"
                      :style="{
                        width: '100%',
                        color: '#fff',
                      }"
                    >
                      <template v-slot:default="{ value }">
                        <strong class="mx-3">Accepted </strong>
                        <span>{{ !!(value % 1) ? value.toFixed(2) : value }}%</span>
                      </template>
                    </v-progress-linear>
                    <v-progress-linear
                      v-else
                      rounded
                      v-model="proposal.nayesProgress"
                      color="grey lighten-2"
                      backgroundColor="#e0e0e0"
                      height="24"
                      :style="{
                        width: '100%',
                        color: '#333',
                      }"
                    >
                      <template v-slot:default="{ value }">
                        <strong class="mx-3">Rejected </strong>
                        <span>{{ !!(value % 1) ? value.toFixed(2) : value }}%</span>
                      </template>
                    </v-progress-linear>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-window-item>
      </v-window>
      <v-dialog v-model="openVDialog" max-width="600" scrollable>
        <v-card>
          <v-card-title>Cast Vote</v-card-title>
          <v-card-text>
            <form-validator v-model="isValidFarm">
              <input-validator :value="selectedFarm" :rules="[validators.required('Required field')]" #="{ props }">
                <input-tooltip tooltip="Select farm you wish to vote with">
                  <v-select
                    :items="userFarms"
                    :item-title="item => `${item.name}`"
                    :item-value="item => item.farmID"
                    label="Select a farm"
                    v-model="selectedFarm"
                    v-bind="props"
                  >
                  </v-select>
                </input-tooltip>
              </input-validator>
            </form-validator>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn @click="castVote" :loading="loadingVote" color="primary white--text" :disabled="!isValidFarm"
              >Vote</v-btn
            >
            <v-btn @click="openVDialog = false" color="grey lighten-2 black--text">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="openInfoModal" width="50vw">
        <v-card>
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
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { Proposal, Proposals } from "@threefold/tfchain_client";
import type moment from "moment";
import { createToast } from "mosha-vue-toastify";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import type { Farm } from "../types";
import { getFarms } from "../utils/get_farms";
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
const isValidFarm = ref(false);
const selectedProposal = ref("");
const selectedFarm = ref();
const userFarms = ref<Farm[]>();

const profileManager = useProfileManager();
const profile = ref(profileManager.profile!);
const tabs = [
  { title: "Active", content: activeProposals },
  { title: "Executable", content: inactiveProposals },
];

onMounted(async () => {
  const grid = await getGrid(profile.value);

  if (grid) {
    proposals.value = await grid?.dao.get();
    activeProposals.value = proposals.value.active.filter(proposal => proposal.hash);
    inactiveProposals.value = proposals.value.inactive.filter(proposal => proposal.hash);

    userFarms.value = await getFarms(grid, { ownedBy: profile.value.twinId }, {});
    loadingProposals.value = false;
  }
});
function expired(proposalEnd: moment.Moment) {
  return proposalEnd.isAfter(Date.now());
}
function openVoteDialog(hash: any, vote: boolean) {
  openVDialog.value = true;
  castedVote.value = vote;
  selectedProposal.value = hash;
}
function filteredProposals(proposals: Proposal[] | undefined) {
  if (searchTerm.value.length) {
    if (proposals) {
      return proposals.filter(proposal => proposal.description.includes(searchTerm.value));
    }
  }
  return proposals;
}
async function castVote() {
  loadingVote.value = true;
  const grid = await getGrid(profile.value);

  if (grid) {
    try {
      await grid.dao.vote({
        address: profile.value.address,
        farmId: selectedFarm.value,
        approve: castedVote.value,
        hash: selectedProposal.value,
      });
      createToast("Voted for proposal!", {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "#1aa18f",
        timeout: 5000,
        showIcon: true,
        type: "success",
      });
    } catch (err) {
      createToast(`Vote Failed!`, {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "#FF5252",
        timeout: 5000,
        showIcon: true,
        type: "danger",
      });
    }
  }
  loadingVote.value = false;
}
</script>
<style scoped>
.custom-container {
  width: 80%;
}
.votes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
