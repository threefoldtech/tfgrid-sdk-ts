<template>
  <v-snackbar color="primary" variant="tonal" v-model="openSnackbar" :timeout="1500">
    Copied!

    <template v-slot:actions>
      <v-btn variant="text" @click="openSnackbar = false"> Ok </v-btn>
    </template>
  </v-snackbar>
  <slot
    :props="{
      'append-inner-icon': 'mdi-content-copy',
      'onClick:append-inner': copy,
    }"
  ></slot>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps({ data: String })
const openSnackbar = ref(false)

function copy() {
  navigator.clipboard.writeText(props.data || '')
  openSnackbar.value = true
}
</script>

<script lang="ts">
export default {
  name: 'CopyInputWrapper',
}
</script>
