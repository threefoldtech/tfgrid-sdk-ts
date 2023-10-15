<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      fullscreen
      @update:modelValue="(val:boolean) => $emit('close-dialog', val)"
      :scrim="false"
      transition="dialog-bottom-transition"
      hide-overlay
    >
      <v-toolbar dark color="info">
        <v-btn icon dark @click="() => $emit('close-dialog', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ farm.name }}</v-toolbar-title>
      </v-toolbar>

      <v-sheet :loading="loading" class="d-flex justify-center align-start">
        <v-card class="d-inline-flex flex-column ma-5" max-width="50%">
          <v-card-item title="Farm Details"> </v-card-item>
          <v-card-text variant="tonal">
            <v-row>
              <v-col class="text-h6" cols="6"> ID </v-col>
              <v-col cols="6" class="text-body-6 text-right">
                {{ farm.farmId }}
              </v-col>
              <v-divider></v-divider>
              <v-col class="text-h6" cols="6"> Name </v-col>
              <v-col cols="6" class="text-body-6 text-right">
                {{ farm.name }}
              </v-col>
              <v-divider></v-divider>
              <v-col class="text-h6" cols="6"> Stellar Address </v-col>
              <v-col cols="6" class="text-body-6 text-right">
                {{ farm.stellarAddress == "" ? "None" : farm.stellarAddress }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="d-inline-flex flex-column ma-5" max-width="75%" v-if="twin">
          <v-card-item title="Farm Twin Details"> </v-card-item>
          <v-card-text variant="tonal">
            <v-row>
              <v-col class="text-h6" cols="6"> ID </v-col>
              <v-col cols="6" class="text-body-6 text-right">
                {{ twin.twinId }}
              </v-col>
              <v-divider></v-divider>
              <v-col class="text-h6" cols="6"> Account ID </v-col>
              <v-col cols="6" class="text-body-6 text-right">
                {{ twin.accountId }}
              </v-col>
              <v-divider></v-divider>
              <v-col class="text-h6" cols="6"> Relay </v-col>
              <v-col cols="6" class="text-body-6 text-right">
                {{ twin.relay }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-sheet>
    </v-dialog>
  </v-row>
</template>

<script lang="ts" setup>
import type { Twin } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import { ref, watch } from "vue";

import type { IFarm } from "../farms.vue";

const props = defineProps({
  openDialog: {
    type: Boolean,
    required: true,
  },
  farm: {
    type: Object as PropType<IFarm>,
    required: true,
  },
  twin: {
    type: Object as PropType<Twin>,
    required: true,
  },
});

const dialog = ref<boolean>(false);
const loading = ref<boolean>(false);

watch(
  () => props.openDialog,
  newValue => {
    dialog.value = newValue as boolean;
  },
);
</script>

<script lang="ts">
export default {
  name: "Farm Dialog",
};
</script>
