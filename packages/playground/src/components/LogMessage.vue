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
        v-if="collapsable && !collapsed"
        @click="collapsed = !collapsed"
        class="show-more-btn text-body-2"
        v-text="collapsed ? 'show more' : 'show less'"
      />
    </VListItemSubtitle>
    <VListItemTitle class="text-pre-wrap text-body-2 pb-3">
      {{ collapsable && collapsed ? log.data.message.slice(0, 200) : log.data.message }}
      {{ collapsable && collapsed ? "..." : "" }}
      <a
        v-if="collapsable"
        @click="collapsed = !collapsed"
        class="show-more-btn"
        v-text="collapsed ? 'show more' : 'show less'"
      />
    </VListItemTitle>
  </VListItem>
</template>

<script lang="ts">
import { type PropType, ref } from "vue";
import { computed, toRef } from "vue";

import type { Indexed } from "@/clients";

import type { LoggerInstance } from "./logger.vue";

export default {
  name: "LogMessage",
  props: {
    log: { type: Object as PropType<Indexed<LoggerInstance>>, required: true },
  },
  setup(_props) {
    const props = toRef(_props);

    const collapsable = computed(() => props.value.log.data.message?.length > 200);
    const collapsed = ref(true);

    return { collapsable, collapsed };
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
