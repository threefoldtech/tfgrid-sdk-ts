<template>
  <v-dialog
    model-value
    scrollable
    width="70%"
    :persistent="layout?.status === 'deploy' || deleting"
    @update:model-value="$emit('close')"
  >
    <weblet-layout ref="layout" @back="$emit('back')">
      <template #title><slot name="title"></slot> </template>

      <template #header-actions>
        <v-btn-toggle
          divided
          v-model="showType"
          mandatory
          :disabled="layout?.status || deleting"
          class="mt-2"
        >
          <v-btn variant="outlined" :disabled="workers.length === 0"> List </v-btn>
          <v-btn variant="outlined"> Deploy </v-btn>
        </v-btn-toggle>
      </template>

      <template v-if="showType === 0">
        <slot name="list"></slot>
      </template>

      <form-validator v-model="valid" v-else>
        <slot name="deploy"></slot>
      </form-validator>

      <template #footer-actions>
        <v-btn
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          :disabled="selectedWorkers.length === 0 || deleting"
          v-if="showType === 0"
          @click="deletingDialog = true"
        >
          Delete
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="!valid"
          @click="$emit('deploy', layout)"
          v-if="showType === 1"
        >
          Deploy
        </v-btn>
        <v-btn color="error" variant="tonal" v-if="!deleting" @click="$emit('close')">
          Close
        </v-btn>
      </template>
    </weblet-layout>
  </v-dialog>

  <v-dialog width="50%" v-model="deletingDialog">
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following workers?
      </v-card-title>
      <v-card-text>
        <v-chip class="ma-1" color="primary" label v-for="w in selectedWorkers" :key="w.name">
          {{ w.name }}
        </v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="onDelete"> Remove </v-btn>
        <v-btn color="error" variant="tonal" @click="deletingDialog = false"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{ workers: any[]; selectedWorkers: any[]; deleting: boolean }>()
const emits = defineEmits<{
  (event: 'close'): void
  (event: 'delete', cb: (workers: any[]) => void): void
  (event: 'deploy', layout: any): void
  (event: 'back'): void
}>()

const layout = ref()
const showType = ref(props.workers.length === 0 ? 1 : 0)
const valid = ref(true)
const deletingDialog = ref(false)

function onDelete() {
  deletingDialog.value = false
  emits('delete', (workers) => {
    if (workers.length === 0) {
      showType.value = 1
    }
  })
}
</script>

<script lang="ts">
export default {
  name: 'ManageWorkerDialog',
}
</script>
