<template>
  <div class="mt-8">
    <v-container v-if="editingTwin">
      <v-dialog v-model="editingTwin" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">Edit Twin</v-toolbar>
          <div class="text-h2 pa-10">
            <v-text-field v-model="relay" outlined></v-text-field>
          </div>
          <v-card-actions class="justify-end pa-5">
            <v-btn @click="editingTwin = false" class="grey lighten-2 black--text">Close</v-btn>
            <v-btn @click="UpdateRelay" class="primary white--text">Submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <v-container class="custom-container">
      <v-card color="primary" class="my-3 pa-3 text-center">
        <v-icon width="26">mdi-account-supervisor-outline</v-icon>
        <h2>Twin Details</h2>
      </v-card>

      <v-card>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="1" sm="2" class="column-style">
              <v-list-item> ID </v-list-item>
              <v-divider></v-divider>
              <v-list-item> Address </v-list-item>
              <v-divider></v-divider>
              <v-list-item> Relay </v-list-item>
            </v-col>
            <v-col cols="1" sm="10">
              <v-list-item> {{ profileManager.profile?.twinId.toString() }} </v-list-item>
              <v-divider></v-divider>
              <v-list-item> {{ profileManager.profile?.address }} </v-list-item>
              <v-divider></v-divider>
              <v-list-item> {{ profileManager.profile?.relay }} </v-list-item>
            </v-col>
          </v-row>
        </v-list>
        <v-card-actions v-if="updateRelay" class="justify-end">
          <v-btn color="primary" class="custom-button" @click="editTwin">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { GridClient } from "@threefold/grid_client";
import { generatePublicKey } from "@threefold/rmb_direct_client";
import { Twins } from "@threefold/tfchain_client";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();

const editingTwin = ref(false);
const relay = ref(profileManager.profile?.relay || "");
const updateRelay = ref(false);

onMounted(validateEdit);
async function validateEdit() {
  const client = new GridClient({ mnemonic: profileManager.profile!.mnemonic, network: window.env.NETWORK });
  try {
    await client._connect();
    const pk = await generatePublicKey(profileManager.profile!.mnemonic);
    if (pk !== profileManager.profile?.pk || profileManager.profile?.relay !== window.env.RELAY_DOMAIN) {
      updateRelay.value = true;
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
  const grid = await getGrid(profileManager.profile!);
  const twins = new Twins(grid!.tfclient);
  const newPk = await generatePublicKey(profileManager.profile!.mnemonic);
  await twins.update({ pk: newPk, relay: relay.value });
  profileManager.updateRelay(window.env.RELAY_DOMAIN);
  profileManager.updatePk(newPk);
  updateRelay.value = false;
}
</script>

<style>
.custom-container {
  width: 80%;
}

.custom-list {
  overflow: hidden;
  font-size: 20px;
  padding: 10px;
}

.column-style {
  border-right: 0.1px solid #8a8a8a;
}

.custom-button {
  font-size: 20px;
  font-weight: bold;
}

.custom-toolbar {
  font-size: 20px;
  font-weight: bold;
  padding-left: 10px;
}
</style>
