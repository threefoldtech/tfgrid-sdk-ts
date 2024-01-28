<template>
  <VListItem class="log-list-item py-0">
    <template #prepend>
      <span
        class="text-uppercase mr-3 py-3 text-center border h-100 text-subtitle-2"
        :class="{
          'text-primary': log.data.type === 'log',
          'text-error': log.data.type === 'error',
          'text-warning': log.data.type === 'warn',
          'text-blue': log.data.type === 'debug',
        }"
        :style="{
          width: '80px',
          borderTopWidth: '0 !important',
          borderBottomWidth: '0 !important',
          borderLeftWidth: '0 !important',
        }"
      >
        [{{ log.data.type }}]
      </span>
    </template>
    <VListItemSubtitle class="pt-3 mb-2 text-caption d-flex align-center">
      <span v-text="log.data.timestamp" />
      <VSpacer />
      <a
        v-if="log.data.messages.join().length > 200"
        @click="collapsed = !collapsed"
        class="show-more-btn"
        v-text="collapsed ? 'show more' : 'show less'"
      />
    </VListItemSubtitle>
    <VListItemTitle class="text-wrap text-body-2 pb-3">
      {{ normalizeLog(log.data.messages) }}
    </VListItemTitle>
  </VListItem>
</template>

<script lang="ts">
import { type PropType, ref } from "vue";

import type { Indexed } from "@/clients";

import type { LoggerInstance } from "./logger.vue";

export default {
  name: "LogMessage",
  props: {
    log: { type: Object as PropType<Indexed<LoggerInstance>>, required: true },
  },
  setup() {
    const collapsed = ref(true);
    function normalizeLog(msgs: any[]): string {
      const res = msgs.join(" ");
      if (collapsed.value && res.length > 200) {
        return res.slice(0, 200) + "...";
      }
      return res;
    }

    return { collapsed, normalizeLog };
  },
};
</script>

<style>
.show-more-btn {
  cursor: pointer;
}

.show-more-btn:hover {
  text-decoration: underline;
}
</style>
