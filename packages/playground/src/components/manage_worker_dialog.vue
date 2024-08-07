<template>
  <v-dialog
    model-value
    scrollable
    :persistent="layout?.status === 'deploy' || deleting"
    @update:model-value="$emit('close')"
    attach="#modals"
  >
    <weblet-layout ref="layout" @back="$emit('back')">
      <template #title><slot name="title"></slot> </template>

      <template #header-actions>
        <v-btn-toggle divided v-model="showType" mandatory :disabled="layout?.status || deleting" class="mt-2">
          <v-btn :disabled="workers.length === 0"> List </v-btn>
          <v-btn> Deploy </v-btn>
        </v-btn-toggle>
      </template>

      <template v-if="showType === 0">
        <slot name="list"></slot>
      </template>

      <d-tabs v-else :tabs="[{ title: 'Config', value: 'config' }]">
        <template #config>
          <slot name="deploy"></slot>
        </template>
      </d-tabs>

      <template #footer-actions="{ validateBeforeDeploy }">
        <v-btn color="anchor" v-if="!deleting" @click="$emit('close')"> Close </v-btn>
        <v-btn
          color="error"
          prepend-icon="mdi-delete"
          :disabled="selectedWorkers.length === 0 || deleting"
          v-if="showType === 0"
          @click="deletingDialog = true"
        >
          Delete
        </v-btn>
        <v-btn
          color="secondary"
          @click="validateBeforeDeploy(() => $emit('deploy', layout), false)"
          v-if="showType === 1"
        >
          Deploy
        </v-btn>
      </template>
    </weblet-layout>
  </v-dialog>

  <v-dialog width="50%" v-model="deletingDialog" attach="#modals">
    <v-card>
      <v-card-title class="text-h5"> Are you sure you want to delete the following workers? </v-card-title>
      <v-card-text>
        <v-chip class="ma-1" label v-for="w in selectedWorkers" :key="w.name">
          {{ w.name }}
        </v-chip>
      </v-card-text>
      <v-card-actions class="justify-end mb-1 mr-2">
        <v-btn color="anchor" @click="deletingDialog = false"> Cancel </v-btn>
        <v-btn color="error" @click="onDelete"> Remove </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
  workers: any[];
  selectedWorkers: any[];
  deleting: boolean;
}>();
const emits = defineEmits<{
  (event: "close"): void;
  (event: "delete", cb: (workers: any[]) => void): void;
  (event: "deploy", layout: any): void;
  (event: "back"): void;
}>();

const layout = ref();
const showType = ref(props.workers.length === 0 ? 1 : 0);
const deletingDialog = ref(false);

function onDelete() {
  deletingDialog.value = false;
  emits("delete", workers => {
    if (workers.length === 0) {
      showType.value = 1;
    }
  });
}
</script>

<script lang="ts">
export default {
  name: "ManageWorkerDialog",
};
</script>
