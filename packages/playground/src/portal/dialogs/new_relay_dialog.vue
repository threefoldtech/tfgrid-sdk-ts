<template>
  <v-container v-if="$props.isNewRelay">
    <v-dialog v-model="$props.isNewRelay" max-width="600">
      <v-card>
        <v-toolbar height="45" color="primary">
          <div class="text-center w-100">
            <v-icon>mdi-link-plus</v-icon>
            <strong> New Relay </strong>
          </div>
        </v-toolbar>
        <div class="text-h2 pa-10">
          <v-text-field
            v-model="relay"
            outlined
            label="Relay"
            :error-messages="errorMessage ? errorMessage : ''"
            clearable
            hide-details="auto"
          />
        </div>
        <v-divider />
        <v-card-actions class="justify-end pa-5 pt-4">
          <v-btn
            :disabled="!relay || errorMessage !== undefined || isLoading"
            :loading="isLoading"
            @click="save"
            variant="tonal"
            color="primary"
            class="white--text"
            text="Add new relay"
          />

          <v-btn
            :disabled="isLoading"
            @click="cancel"
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
import { defineComponent, defineProps, type PropType, ref, watch } from "vue";

const relay = ref<string>();

defineProps({
  isNewRelay: {
    type: Boolean,
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

const emits = defineEmits(["save", "cancel", "validateRelay"]);
const save = () => emits("save", relay.value);
const cancel = () => emits("cancel");

watch(relay, () => emits("validateRelay", relay.value), { deep: true });
</script>

<script lang="ts">
export default defineComponent({
  name: "NewRelayDialog",
});
</script>
