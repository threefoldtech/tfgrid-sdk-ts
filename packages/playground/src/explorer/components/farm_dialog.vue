<template>
  <v-dialog v-model="dialog" hide-overlay transition="dialog-bottom-transition" :scrim="false">
    <v-container>
      <v-toolbar>
        <div class="d-flex justify-center">
          <v-btn icon dark @click="() => $emit('close-dialog', false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-toolbar>

      <template v-if="loading">
        <div color="transparent" class="text-center">
          <v-progress-circular color="primary" indeterminate :size="50" :width="5" />
          <p>Loading farm details...</p>
        </div>
      </template>

      <template v-else>
        <v-card>
          <v-row class="pa-5">
            <v-col>
              <farm-details-card :farm="farm" />
            </v-col>
            <v-col>
              <twin-details-card :farm="farm" />
            </v-col>
          </v-row>
        </v-card>
      </template>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import type { Farm } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import { ref, watch } from "vue";

import FarmDetailsCard from "./node_details_cards/farm_details_card.vue";
import TwinDetailsCard from "./node_details_cards/twin_details_card.vue";

export default {
  props: {
    openDialog: {
      type: Boolean,
      required: true,
    },
    farm: {
      type: Object as PropType<Farm>,
      required: true,
    },
  },
  components: {
    FarmDetailsCard,
    TwinDetailsCard,
  },
  setup(props, { emit }) {
    const loading = ref(false);
    const dialog = ref(props.openDialog);

    function closeDialog(newValue: boolean) {
      emit("close-dialog", newValue);
    }

    watch(
      () => props.openDialog,
      newValue => {
        dialog.value = newValue as boolean;
      },
    );

    return {
      dialog,
      loading,
      closeDialog,
    };
  },
};
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
