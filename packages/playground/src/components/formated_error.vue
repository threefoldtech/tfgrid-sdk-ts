<template>
  <template v-if="Array.isArray(error)">
    <FormatedError v-for="item in error" :depth="depth + 1" :key="item.id" :error="item" />
  </template>

  <template v-else-if="error.type === 'Literal'">
    <span style="word-break: break-all" v-text="normalizeText(error.value)" />
  </template>

  <template v-else-if="error.type === 'Object' || error.type === 'Array'">
    <div
      :class="{
        'd-inline': collapsed,
        'd-flex': !collapsed && root,
        'd-inline-flex': !collapsed && !root,
        'align-start': !collapsed,
      }"
    >
      <v-btn class="mr-1" color="error" variant="tonal" icon @click.stop="collapsed = !collapsed">
        <VIcon icon="mdi-chevron-right" class="open-arrow" :class="{ 'is-active': !collapsed }" />
      </v-btn>
      <span v-show="collapsed">
        <span v-html="error.type === 'Array' ? '&#91; ' : '&#123; '" />
        <span :style="{ backgroundColor: 'rgba(var(--v-theme-error), 0.2)' }" v-text="'...'" />
        <span v-html="error.type === 'Array' ? ' &#93;' : ' &#125;'" /><span v-if="!root" v-text="','" />
      </span>

      <div v-show="!collapsed">
        <span v-html="error.type === 'Array' ? '&#91; ' : '&#123; '" />
        <div class="ml-4 d-flex" v-for="([key, item], index) in Object.entries(error.value)" :key="item.id">
          "{{ key }}":
          <FormatedError
            :depth="depth + 1"
            :error="item"
            :coma="index !== Object.keys(error.value).length - 1"
            is-prop
          />
        </div>
        <span v-html="error.type === 'Array' ? ' &#93;' : ' &#125;'" /><span v-if="coma" v-text="','" />
      </div>
    </div>
  </template>

  <template v-else> here? </template>
</template>

<script lang="ts">
import { toRef } from "vue";
import { computed } from "vue";
import { type PropType, ref } from "vue";

export type ErrorToken =
  | { id: number; type: "Literal"; value: string }
  | { id: number; type: "Array"; value: ErrorToken[] }
  | { id: number; type: "Object"; value: { [key: string]: ErrorToken } };

export default {
  name: "FormatedError",
  props: {
    error: { type: Object as PropType<ErrorToken | ErrorToken[]>, required: true },
    depth: { type: Number, default: () => 0 },
    coma: { type: Boolean, default: () => false },
    isProp: { type: Boolean, default: () => false },
  },
  setup(_props) {
    const props = toRef(_props);
    const root = computed(() => props.value.depth === 1);
    const collapsed = ref(true);

    function normalizeText(text: string) {
      if (props.value.isProp) text = `"${text}"`;
      if (props.value.coma) text += ",";
      return text;
    }

    return { root, collapsed, normalizeText };
  },
};
</script>

<style scoped lang="scss">
button {
  --v-btn-height: 0;
  padding: 0 !important;
}

.open-arrow.is-active {
  transform: rotate(90deg);
}
</style>
