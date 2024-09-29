<template>
  <template v-if="Array.isArray(msg)">
    <FormattedLog v-for="item in msg" :depth="depth + 1" :key="item.id" :msg="item" />
  </template>

  <template v-else-if="msg.type === 'Literal'">
    <span style="word-break: break-all" v-text="normalizeText(msg.value)" />
  </template>

  <template v-else-if="msg.type === 'Object' || msg.type === 'Array'">
    <div
      :class="{
        'd-inline': collapsed,
        'd-flex': !collapsed && root,
        'd-inline-flex': !collapsed && !root,
        'align-start': !collapsed,
      }"
    >
      <v-btn class="mr-1" variant="tonal" icon @click.stop="collapsed = !collapsed">
        <VIcon icon="mdi-chevron-right" class="open-arrow" :class="{ 'is-active': !collapsed }" />
      </v-btn>
      <span v-show="collapsed">
        <span v-html="msg.type === 'Array' ? '&#91; ' : '&#123; '" />
        <span v-text="'...'" />
        <span v-html="msg.type === 'Array' ? ' &#93;' : ' &#125;'" /><span v-if="!root" v-text="','" />
      </span>

      <div v-show="!collapsed">
        <span v-html="msg.type === 'Array' ? '&#91; ' : '&#123; '" />
        <div class="ml-4 d-flex" v-for="([key, item], index) in Object.entries(msg.value)" :key="item.id">
          "{{ key }}":
          <FormattedLog :depth="depth + 1" :msg="item" :coma="index !== Object.keys(msg.value).length - 1" is-prop />
        </div>
        <span v-html="msg.type === 'Array' ? ' &#93;' : ' &#125;'" /><span v-if="coma" v-text="','" />
      </div>
    </div>
  </template>

  <template v-else> here? </template>
</template>

<script lang="ts">
import { toRef } from "vue";
import { computed } from "vue";
import { type PropType, ref } from "vue";

export type MsgToken =
  | { id: number; type: "Literal"; value: string }
  | { id: number; type: "Array"; value: MsgToken[] }
  | { id: number; type: "Object"; value: { [key: string]: MsgToken } };

export default {
  name: "FormattedLog",
  props: {
    msg: { type: Object as PropType<MsgToken | MsgToken[]>, required: true },
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
