<template>
  <VDialog model-value fullscreen class="terms-dialog" @update:model-value="$emit('exit')">
    <VCard>
      <VRow align="center" justify="center" v-if="!loaded">
        <div class="text-center">
          <VProgressCircular indeterminate size="50" color="secondary" />
          <p class="mt-4">Loading Terms And Conditions...</p>
        </div>
      </VRow>

      <VFadeTransition>
        <div v-show="loaded" class="h-100">
          <iframe
            src="https://library.threefold.me/info/legal/#/"
            frameborder="0"
            :style="{ height: 'calc(100% - 63px)' }"
            width="100%"
            sandbox="allow-forms allow-modals allow-scripts allow-popups allow-same-origin"
            @load="loaded = true"
          />
          <VBtn
            block
            color="primary"
            variant="tonal"
            text="Accept terms and conditions"
            height="50"
            @click="
              $emit('accept', $event);
              $emit('exit');
            "
          />
        </div>
      </VFadeTransition>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "TermsAndConditions",
  emit: {
    accept: (value: MouseEvent) => true || value,
    exit: () => true,
  },
  setup() {
    const loaded = ref(false);

    return { loaded };
  },
};
</script>

<style>
.terms-dialog {
  z-index: 1000001 !important;
}
</style>
