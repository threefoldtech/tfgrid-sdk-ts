<template>
  <v-dialog
    v-model="dialog"
    @update:modelValue="(val:boolean) => $emit('close-dialog', val)"
    transition="dialog-bottom-transition"
  >
    <v-container>
      <v-toolbar dark color="info" v-if="!loading">
        <div class="d-flex justify-end">
          <v-btn icon dark @click="() => $emit('close-dialog', false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-toolbar>

      <template v-if="loading">
        <div color="transparent" class="text-center">
          <v-progress-circular color="primary" indeterminate :size="50" :width="5" />
          <p class="mt-2">Loading farm details...</p>
        </div>
      </template>

      <template v-else>
        <v-card class="h-100">
          <v-row class="pa-8 mt-2" justify-md="start" justify-sm="center">
            <v-col cols="12" md="6" sm="8">
              <farm-details-card :farm="farm" />
            </v-col>
            <v-col cols="12" md="6" sm="8" v-if="twin">
              <v-card-title class="bg-info">
                <h4 class="text-center">
                  <v-icon icon="mdi-account" size="x-large" />
                  Twin Details
                </h4>
              </v-card-title>
              <v-card-item class="mt-2 mb-2 px-0">
                <v-row>
                  <v-col class="d-flex justify-start align-center font-weight-bold ml-3 text-subtitle-1"> ID </v-col>
                  <v-col class="d-flex justify-end align-center mr-3 text-body-6">
                    {{ twin.twinId }}
                  </v-col>
                  <v-divider></v-divider>
                  <v-col class="d-flex justify-start align-center font-weight-bold ml-3 text-subtitle-1">
                    Account ID
                  </v-col>
                  <v-col class="d-flex justify-end align-center mr-3 text-body-6">
                    <v-tooltip v-if="twin.accountId" location="top" text="Copy the account id to the clipboard.">
                      <template #activator="{ props }">
                        <p v-bind="props" v-if="twin.accountId">
                          {{
                            twin.accountId.length > maxLenChar
                              ? twin.accountId.slice(0, maxLenChar) + "..."
                              : twin.accountId
                          }}
                        </p>
                        <v-icon
                          v-if="twin.accountId && twin.accountId.length"
                          class="ml-1"
                          v-bind="props"
                          icon="mdi-content-copy"
                          @click="copy(twin.accountId)"
                        />
                      </template>
                    </v-tooltip>
                    <p v-else>None</p>
                  </v-col>
                  <v-divider></v-divider>
                  <v-col class="d-flex justify-start align-center font-weight-bold ml-3 text-subtitle-1"> Relay </v-col>
                  <v-col class="d-flex justify-end align-center mr-3 text-body-6">
                    {{ twin.relay }}
                  </v-col>
                </v-row>
              </v-card-item>
            </v-col>
          </v-row>
        </v-card>
      </template>
    </v-container>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { Farm, Twin } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import router from "@/router";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { getTwins } from "../utils/helpers";

const route = useRoute();

const props = defineProps({
  openDialog: {
    type: Boolean,
    required: true,
  },
  farm: {
    type: Object as PropType<Farm>,
    required: true,
  },
});

const dialog = ref<boolean>(true);
const loading = ref<boolean>(false);
const twin = ref<Twin>();
const maxLenChar = 30;

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

const copy = (address: string) => {
  navigator.clipboard.writeText(address);
  createCustomToast("Copied!", ToastType.success);
};

watch(
  () => props.farm,
  async (farm: Farm) => {
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
