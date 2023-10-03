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

    <v-container class="custom-container">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-account-supervisor-outline</v-icon>
        <v-card-title class="pa-0" lor="white">Twin Details</v-card-title>
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
        <v-card-actions v-if="updateRelay" class="justify-end mx-4 mb-4">
          <v-btn class="custom-button bg-primary" @click="editTwin">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { generatePublicKey } from "@threefold/rmb_direct_client";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();

const editingTwin = ref(false);
const relay = ref(profileManager.profile?.relay || "");
const updateRelay = ref(false);
const errorMsg = ref("");

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
  font-size: 20px;
  font-weight: bold;
}

.custom-toolbar {
  font-size: 20px;
  font-weight: bold;
  padding-left: 10px;
}
</style>
