<template>
  <v-dialog
    model-value
    scrollable
    :persistent="layout?.status === 'deploy' || deleting"
    attach="#modals"
    @update:model-value="$emit('close')"
  >
    <weblet-layout ref="layout" @back="$emit('back')">
      <template #title>
        <slot name="title" />
      </template>

      <template #header-actions>
        <v-btn-toggle v-model="showType" divided mandatory :disabled="layout?.status || deleting" class="mt-2">
          <v-btn :disabled="workers.length === 0">
            List
          </v-btn>
          <v-btn> Deploy </v-btn>
        </v-btn-toggle>
      </template>

      <template v-if="showType === 0">
        <slot name="list" />
      </template>

      <d-tabs v-else :tabs="[{ title: 'Config', value: 'config' }]">
        <template #config>
          <slot name="deploy" />
        </template>
      </d-tabs>

      <template #footer-actions="{ validateBeforeDeploy }">
        <v-btn v-if="!deleting" color="anchor" @click="$emit('close')">
          Close
        </v-btn>
        <v-btn
          v-if="showType === 0"
          color="error"
          prepend-icon="mdi-delete"
          :disabled="selectedWorkers.length === 0 || deleting"
          @click="deletingDialog = true"
        >
          Delete
        </v-btn>
        <v-btn
          v-if="showType === 1"
          color="secondary"
          @click="validateBeforeDeploy(() => $emit('deploy', layout), false)"
        >
          Deploy
        </v-btn>
      </template>
    </weblet-layout>
  </v-dialog>

  <v-dialog v-model="deletingDialog" width="50%" attach="#modals">
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following workers?
      </v-card-title>
      <v-card-text>
        <v-chip v-for="w in selectedWorkers" :key="w.name" class="ma-1" label>
          {{ w.name }}
        </v-chip>
      </v-card-text>
      <v-card-actions class="justify-end mb-1 mr-2">
        <v-btn color="anchor" @click="deletingDialog = false">
          Cancel
        </v-btn>
        <v-btn color="error" @click="onDelete">
          Remove
        </v-btn>
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
