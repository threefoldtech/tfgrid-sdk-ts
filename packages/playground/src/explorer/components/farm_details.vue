<template>
  <v-dialog
    v-model="dialog"
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

    <template v-if="loading">
      <v-card class="d-flex justify-center align-center h-screen">
        <v-progress-circular color="primary" indeterminate :size="128" :width="5" />
        <p class="mt-2">Loading farm details...</p>
      </v-card>
    </template>

    <template v-else>
      <v-card class="d-inline-flex flex-column ma-5" max-width="50%">
        <v-card-item title="Farm Details"> </v-card-item>
        <v-card-text variant="tonal">
          <v-row class="pa-8 mt-5" justify-md="start" justify-sm="center">
            <v-col cols="12" md="6" sm="8" class="text-h6"> ID </v-col>
            <v-col cols="12" md="6" sm="8" class="text-body-6 text-right">
              {{ farm.farmId }}
            </v-col>
            <v-divider></v-divider>
            <v-col class="text-h6" cols="12" md="6" sm="8"> Name </v-col>
            <v-col cols="12" md="6" sm="8" class="text-body-6 text-right">
              {{ farm.name }}
            </v-col>
            <v-divider></v-divider>
            <v-col class="text-h6" cols="12" md="6" sm="8"> Stellar Address </v-col>
            <v-col cols="12" md="6" sm="8" class="text-body-6 text-right">
              {{ farm.stellarAddress == "" ? "None" : farm.stellarAddress }}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="d-inline-flex flex-column ma-5" max-width="75%" v-if="twin">
        <v-card-item title="Farm Twin Details"> </v-card-item>
        <v-card-text variant="tonal">
          <v-row>
            <v-col class="text-h6" cols="12" md="6" sm="8"> ID </v-col>
            <v-col cols="12" md="6" sm="8" class="text-body-6 text-right">
              {{ twin.twinId }}
            </v-col>
            <v-divider></v-divider>
            <v-col class="text-h6" cols="12" md="6" sm="8"> Account ID </v-col>
            <v-col cols="12" md="6" sm="8" class="text-body-6 text-right">
              {{ twin.accountId }}
            </v-col>
            <v-divider></v-divider>
            <v-col class="text-h6" cols="12" md="6" sm="8"> Relay </v-col>
            <v-col cols="12" md="6" sm="8" class="text-body-6 text-right">
              {{ twin.relay }}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { Twin } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import router from "@/router";

import type { IFarm } from "../farms.vue";
import { getTwins } from "../utils/helpers";

const route = useRoute();

const props = defineProps({
  openDialog: {
    type: Boolean,
    required: true,
  },
  farm: {
    type: Object as PropType<IFarm>,
    required: true,
  },
});

const dialog = ref<boolean>(true);
const loading = ref<boolean>(false);
const twin = ref<Twin>();

const _getTwins = async () => {
  loading.value = true;
  try {
    const { data } = await getTwins({
      twinId: props.farm.twinId,
    });
    twin.value = data[0];
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.farm,
  async (farm: IFarm) => {
    if (farm.twinId > 0) {
      loading.value = true;
      await _getTwins();
      router.push({ path: route.path, query: { twinId: farm.twinId } });
      loading.value = false;
    }
  },
);

watch(
  () => props.openDialog,
  newValue => {
    dialog.value = newValue as boolean;
  },
);

onMounted(async () => {
  await _getTwins();
});
</script>

<style>
.v-list-item__prepend > .v-icon,
.v-list-item__append > .v-icon {
  opacity: 1 !important;
}
.v-toolbar__content {
  justify-content: end !important;
}
</style>
