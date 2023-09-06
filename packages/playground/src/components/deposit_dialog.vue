<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="900">
      <v-card>
        <v-toolbar color="primary" dark> Deposit TFT </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col> Send a name </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
export default {
  name: "DepositDialog",
};
</script>
