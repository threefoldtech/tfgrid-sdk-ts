<template>
  <div style="padding-top: 30px">
    <v-container v-if="editingTwin">
      <v-dialog transition="dialog-bottom-transition" max-width="600" v-model="editingTwin">
        <!-- <v-card>
          <v-toolbar color="primary" dark>Edit Twin</v-toolbar>
          <div class="text-h2 pa-10">
            <v-form>
              <v-select
                :items="items"
                label="Please select a relay:"
                v-model="selectedItem.item_id"
                item-text="name"
                item-value="id"
              >
              </v-select>
            </v-form>
          </div>
          <v-card-actions class="justify-end pa-5">
            <v-btn @click="editingTwin = false" :disabled="loadingEditTwin" class="grey lighten-2 black--text"
              >Close</v-btn
            >
            <v-btn class="primary white--text" @click="updateTwin" :loading="loadingEditTwin">Submit</v-btn>
          </v-card-actions>
        </v-card> -->
      </v-dialog>
    </v-container>
    <v-container class="custom-container">
      <v-card color="primary" class="my-3 pa-3 text-center">
        <img class="centered-img" :src="baseUrl + 'images/icons/account-supervisor-outline.svg'" />
        <h2 class="white--text">Twin Details</h2>
      </v-card>

      <v-card>
        <v-list style="font-size: 18px">
          <v-row>
            <v-col cols="1" sm="2">
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
        <v-card-actions class="justify-end">
          <v-btn color="primary">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { useProfileManager } from "../stores";

const profileManager = useProfileManager();
const baseUrl = import.meta.env.BASE_URL;

let editingTwin = false;

function editTwin() {
  console.log("editing twin");
  editingTwin = true;
}
</script>

<style>
.custom-container {
  width: 80%;
}
.centered-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 30%;
  height: 10%;
  max-height: 50px;
  max-width: 50px;
}

.white--text {
  color: white;
}
</style>
