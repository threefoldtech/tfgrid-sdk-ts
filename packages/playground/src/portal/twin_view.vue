<template>
  <div style="padding-top: 30px">
    <v-container class="custom-container">
      <v-card color="primary" class="my-3 pa-3 text-center">
        <v-icon width="26">mdi-account-supervisor-outline</v-icon>
        <h2>Twin Details</h2>
      </v-card>

      <v-card>
        <v-list style="overflow: hidden; font-size: 20px">
          <v-row>
            <v-col cols="1" sm="2" style="border-right: 0.1px solid #8a8a8a">
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
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { useProfileManager } from "../stores";

const profileManager = useProfileManager();
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

.edit-button {
  font-weight: bold;
  font-size: 20px;
}
</style>
