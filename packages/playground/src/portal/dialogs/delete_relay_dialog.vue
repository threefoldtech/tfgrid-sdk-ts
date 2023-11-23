<template>
  <v-container>
    <v-dialog v-model="$props.isDelete" max-width="600">
      <v-card>
        <v-toolbar height="45" color="primary">
          <div class="text-center w-100">
            <v-icon>mdi-trash-can-outline</v-icon>
            <strong>
              Delete <span class="text-decoration-underline"> {{ $props.relay }} </span>
            </strong>
          </div>
        </v-toolbar>

        <div v-if="relays.length === 1" class="mt-4 pa-8">
          <v-alert variant="tonal" type="warning">
            You cannot delete this relay as it is the only one connected. Please connect another relay before attempting
            to delete this one.
          </v-alert>
        </div>

        <div v-else class="text-center pa-8 pb-1 mb-5">
          <v-icon size="40">mdi-archive-lock-outline</v-icon>
          <h4 class="mt-2">
            This action cannot be undone, you are about to delete the '
            <strong class="text-primary">{{ $props.relay }}</strong>
            ' relay.
          </h4>
          <div v-if="errorMessage" class="mt-4">
            <v-alert variant="tonal" type="error">{{ errorMessage }}</v-alert>
          </div>
        </div>

        <v-divider />

        <v-card-actions class="justify-end pa-5 pt-4">
          <v-btn
            v-if="relays.length > 1"
            :disabled="isLoading"
            :loading="isLoading"
            @click="emits('confirm', $props.relay)"
            variant="tonal"
            color="primary"
            class="white--text"
            text="I want to delete this relay"
          />

          <v-btn
            :disabled="isLoading"
            @click="emits('cancel')"
            variant="outlined"
            color="error"
            class="grey lighten-2 black--text"
            text="Close"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { defineComponent, defineProps, type PropType } from "vue";

defineProps({
  isDelete: {
    type: Object as PropType<boolean>,
    required: true,
  },
  relay: {
    type: Object as PropType<string>,
    required: true,
  },
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

const emits = defineEmits(["confirm", "cancel"]);
</script>

<script lang="ts">
export default defineComponent({
  name: "DeleteRelayDialog",
});
</script>
