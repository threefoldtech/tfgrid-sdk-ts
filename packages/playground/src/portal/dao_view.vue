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
            <v-tab :value="0" color="primary">Active</v-tab>
            <v-tab :value="1" color="primary">Executable</v-tab>
          </v-tabs>
        </v-card>
        <v-window v-model="activeTab">
          <!--Active-->
          <v-window-item :value="0">
            <v-card>
              <v-text-field
                v-model="searchTerm"
                color="primary darken-2"
                label="Search by proposal action or description"
              ></v-text-field> </v-card
          ></v-window-item>
        </v-window>
        <!-- <v-dialog v-model="openInfoModal" width="50vw">
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
        </v-dialog> -->
      </v-container>
    </v-skeleton-loader>
  </v-container>
</template>
<script lang="ts" setup>
import type { Proposal, Proposals } from "@threefold/tfchain_client";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid } from "../utils/grid";

const loadingProposals = ref(true);
const activeTab = ref(0);
const activeProposals: Proposal[] = [];
const inactiveProposals: Proposal[] = [];
const proposals = ref<Proposals>();
const searchTerm = ref("");
const openInfoModal = ref(false);

const profileManager = useProfileManager();
const profile = ref(profileManager.profile!);
const tabs = [
  { title: "Active", content: activeProposals },
  { title: "Executable", content: inactiveProposals },
];

onMounted(async () => {
  const grid = await getGrid(profile.value);
  proposals.value = await grid?.dao.get();
  console.log(proposals.value?.active?.length);
});
</script>
