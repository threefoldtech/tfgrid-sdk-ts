<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Twin ID" prepend-icon="mdi-id-card">
          <template #subtitle>
            <strong>{{ profileManager.profile?.twinId.toString() }}</strong>
          </template>
        </v-card>
      </v-col>

      <v-col>
        <v-card class="mx-auto" title="Twin Address" prepend-icon="mdi-at">
          <template #subtitle>
            <div class="w-100 d-flex justify-space-between align-center">
              <strong>{{ address }}</strong>
              <v-icon @click="emits('copy-address', address)"> mdi-content-copy </v-icon>
            </div>
          </template>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="mx-auto" :title="$props.relays.length ? 'Relays' : 'Relay'" prepend-icon="mdi-swap-horizontal">
          <div class="pa-5">
            <v-row>
              <v-col :cols="relays.length === 1 ? 12 : 6" v-for="(relay, index) in relays" :key="relay">
                <v-card variant="tonal" class="w-100" :title="`Relay ${index + 1}`" prepend-icon="mdi-link-variant">
                  <template #append>
                    <v-btn
                      :disabled="isLoading"
                      @click="updateRelay(relay)"
                      v-if="!isEditRelay || selectedRelayCopy != relay"
                      title="Edit this relay"
                      elevation="0"
                      icon="mdi-pencil"
                      class="mr-1"
                    >
                      <template #default>
                        <v-icon color="info"></v-icon>
                      </template>
                    </v-btn>

                    <v-btn
                      :disabled="isLoading"
                      @click="deleteRelay(relay)"
                      title="Delete this relay"
                      elevation="0"
                      icon="mdi-trash-can"
                    >
                      <template #default>
                        <v-icon color="error"></v-icon>
                      </template>
                    </v-btn>
                  </template>
                  <template #subtitle>
                    <div v-if="isEditRelay && selectedRelayCopy === relay">
                      <v-text-field
                        :disabled="isLoading"
                        v-model="selectedRelay"
                        class="mt-3 mb-3"
                        hide-details="auto"
                        clearable
                        :error-messages="errorMessage ? errorMessage : ''"
                        :messages="isLoading ? `Updating relay ${relay} to ${selectedRelay}, please wait...` : ''"
                      />

                      <div>
                        <v-btn
                          :loading="isLoading"
                          :disabled="isLoading || selectedRelay === relay"
                          class="mr-4"
                          color="success"
                          variant="tonal"
                          text="Update"
                          title="Update"
                          elevation="2"
                          @click="onUpdateRelay(relay, selectedRelay!)"
                        />

                        <v-btn
                          text="Cancel"
                          :disabled="isLoading"
                          @click="cancelUpdateRelay"
                          color="error"
                          variant="outlined"
                          title="Cancel"
                          elevation="2"
                        />
                      </div>
                    </div>
                    <strong v-else class="font-bold text-lg">{{ relay }}</strong>
                  </template>
                </v-card>
              </v-col>
            </v-row>
          </div>
          <v-card-actions class="justify-end mx-4 mb-4">
            <v-btn width="10%" class="custom-button bg-primary" @click="newRelay">New Relay</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { defineComponent, defineProps, type PropType, ref, watch } from "vue";

import { useProfileManager } from "../../stores";

defineProps({
  relays: {
    type: Object as PropType<string[]>,
    required: true,
  },
  errorMessage: {
    type: Object as PropType<string>,
    required: false,
  },
  isLoading: {
    type: Object as PropType<boolean>,
    required: false,
  },
});

const emits = defineEmits(["copy-address", "delete-relay", "update-relay", "new-relay", "validate-relay"]);

const profileManager = useProfileManager();
const address = profileManager.profile?.address;
const isEditRelay = ref<boolean>(false);
const selectedRelay = ref<string | undefined>();
let selectedRelayCopy: string | undefined = selectedRelay.value;

watch(selectedRelay, () => emits("validate-relay", selectedRelay.value), { deep: true });

const onUpdateRelay = (relay: string, newValue: string) => {
  emits("update-relay", relay, newValue);
};

const updateRelay = (relay: string) => {
  // Gets the selected relay and makes it ready to be updated.
  cancelUpdateRelay();
  selectedRelay.value = relay;
  selectedRelayCopy = selectedRelay.value;
  isEditRelay.value = true;
};

const cancelUpdateRelay = () => {
  isEditRelay.value = false;
  selectedRelay.value = undefined;
  selectedRelayCopy = selectedRelay.value;
};

const deleteRelay = (relay: string) => {
  cancelUpdateRelay();
  emits("delete-relay", relay);
};

const newRelay = () => emits("new-relay");
</script>

<script lang="ts">
export default defineComponent({
  name: "TwinDetailsComponent",
});
</script>
