<template>
  <div>
    <v-container v-if="editingTwin">
      <v-dialog v-model="editingTwin" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">Edit Twin</v-toolbar>
          <div class="text-h2 pa-10">
            <v-text-field v-model="relay" outlined label="Relay" :error-messages="errorMsg"></v-text-field>
          </div>
          <v-card-actions class="justify-end pa-5">
            <v-btn @click="editingTwin = false" class="grey lighten-2 black--text">Close</v-btn>
            <v-btn @click="UpdateRelay" class="primary white--text">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <v-dialog v-model="openVotePopup" max-width="600">
      <v-card>
        <v-toolbar color="primary" dark class="custom-toolbar bold-text">Vote Reminder</v-toolbar>
        <v-card-text>There are {{ numberOfProposalsToVoteOn }} active proposals you can vote on now</v-card-text>
        <v-card-actions class="justify-end pa-5">
          <v-btn @click="redirectToDao" variant="elevated" color="primary" class="mr-2 text-subtitle-2">Vote</v-btn>
          <v-btn @click="openVotePopup = false" variant="outlined" color="anchor" class="mr-2 text-subtitle-2"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="border px-4 pb-4 rounded position-relative mt-2">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-account-supervisor-outline</v-icon>
        <v-card-title class="pa-0">Twin Details</v-card-title>
      </v-card>

      <v-card>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="1" sm="2" class="column-style my-4">
              <v-list-item> ID </v-list-item>
              <v-divider></v-divider>
              <v-list-item> Address </v-list-item>
              <v-divider></v-divider>
              <v-list-item> Relay </v-list-item>
            </v-col>
            <v-col cols="1" sm="10" class="my-4">
              <v-list-item> {{ profileManager.profile?.twinId.toString() }} </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <span>{{ profileManager.profile?.address }}</span>
                  <v-icon @click="copy(profileManager.profile?.address as string)"> mdi-content-copy </v-icon>
                </div>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item> {{ profileManager.profile?.relay }} </v-list-item>
            </v-col>
          </v-row>
        </v-list>
        <v-card-actions v-if="updateRelay" class="justify-end mx-4 mb-4">
          <v-btn class="custom-button bg-primary" @click="editTwin">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { generatePublicKey } from "@threefold/rmb_direct_client";
import type { Proposal } from "@threefold/tfchain_client";
import { onMounted, ref } from "vue";

import router from "../router";
import { useProfileManager } from "../stores";
import type { Farm } from "../types";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getFarms } from "../utils/get_farms";
import { getGrid } from "../utils/grid";
const profileManager = useProfileManager();

const editingTwin = ref(false);
const relay = ref(profileManager.profile?.relay || "");
const updateRelay = ref(false);
const errorMsg = ref("");
const openVotePopup = ref(false);
const numberOfProposalsToVoteOn = ref(0);
const userFarms = ref<Farm[]>();
const activeProposalsUserHasVotedOn = ref(0);
onMounted(async () => {
  const profile = profileManager.profile!;
  const grid = await getGrid(profile);
  if (!grid) {
    createCustomToast("Fetch Grid Failed", ToastType.danger);

    return;
  }
  userFarms.value = await getFarms(grid, { ownedBy: profile.twinId }, {});
  if (!userFarms.value.length) {
    return;
  }
  const proposals = grid.dao.get();
  const userFarmId = userFarms.value.map(farm => farm.farmID);

  const activeProposals = (await proposals)?.active;
  const numberOfActiveProposals = activeProposals ? activeProposals.length : 0;

  if (!numberOfActiveProposals) {
    return;
  }
  activeProposals.forEach(proposal => {
    if (proposal.nayes.filter(naye => userFarmId.includes(naye.farmId)).length) {
      activeProposalsUserHasVotedOn.value++;
    } else if (proposal.ayes.filter(aye => userFarmId.includes(aye.farmId)).length) {
      activeProposalsUserHasVotedOn.value++;
    }
  });

  if (activeProposalsUserHasVotedOn.value == numberOfActiveProposals) {
    return;
  }
  numberOfProposalsToVoteOn.value = numberOfActiveProposals - activeProposalsUserHasVotedOn.value;
  openVotePopup.value = true;
});

function redirectToDao() {
  router.push({ path: "/portal/dao" });
}
onMounted(validateEdit);
async function validateEdit() {
  try {
    const pk = await generatePublicKey(profileManager.profile!.mnemonic);
    if (profileManager.profile?.relay !== window.env.RELAY_DOMAIN) {
      updateRelay.value = true;
    }

    if (profileManager.profile?.pk !== pk) {
      UpdateRelay();
    }
  } catch (e) {
    console.log(e);
  }
}

function editTwin() {
  console.log("editing twin");
  editingTwin.value = true;
}

async function UpdateRelay() {
  try {
    const pk = await generatePublicKey(profileManager.profile!.mnemonic);
    const grid = await getGrid(profileManager.profile!);
    await grid?.twins.update({ relay: relay.value });
    profileManager.updateRelay(relay.value);
    profileManager.updatePk(pk);
    updateRelay.value = false;
  } catch (e) {
    errorMsg.value = (e as any).message;
    console.log("could not update relay or pk, Error: ", e);
  }
}

function copy(id: string) {
  navigator.clipboard.writeText(id);
  createCustomToast("Address copied to clipboard", ToastType.success);
}
</script>

<style>
.custom-container {
  width: 80%;
}

.custom-list {
  overflow: hidden;
  font-size: 1rem;
  padding: 10px;
}

.column-style {
  border-right: 0.1px solid #8a8a8a;
}

.custom-button {
  font-size: 16px;
  font-weight: bold;
}

.custom-toolbar {
  font-size: 16px;
  font-weight: bold;
  padding-left: 10px;
}

.bold-text {
  font-weight: 500;
  padding-left: 1rem;
}
</style>
