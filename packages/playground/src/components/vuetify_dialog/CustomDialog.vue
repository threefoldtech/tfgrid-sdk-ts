<template>
  <v-dialog v-bind="$props" @update:model-value="$emit('update:model-value', $event)">
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { onUnmounted, watch } from "vue";
import { VDialog } from "vuetify/components/VDialog";

import { useDialogService } from "./DialogLockService.vue";

let _id = 0;

export default {
  name: "CustomDialog",
  extends: VDialog,
  components: { VDialog },
  inheritAttrs: true,
  setup(props) {
    const id = _id++;
    const dialogService = useDialogService();

    const register = () => dialogService.register(id);
    const unregister = () => dialogService.unregister(id);

    watch(
      () => props.modelValue,
      isOpened => {
        isOpened && register();
        !isOpened && unregister();
      },
      { immediate: true },
    );

    onUnmounted(unregister);
  },
};
</script>
