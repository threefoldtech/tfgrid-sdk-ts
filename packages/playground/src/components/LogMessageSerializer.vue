<template>
  <span
    v-if="Serializer.isLiteral(message)"
    class="text-info text-pre-wrap"
    v-html="(leading ? '' : ' ') + message.value"
  />

  <span
    v-else-if="Serializer.isFunction(message)"
    :class="{
      'text-blue': message.value.startsWith('class'),
      'text-pink': !message.value.startsWith('class'),
    }"
  >
    {{ leading ? "" : " " }}
    <template v-if="!message.value.startsWith('class') && !message.value.startsWith('function')">
      function`{{ message.value }}`
    </template>
    <template v-else>
      {{ message.value }}
    </template>
  </span>

  <span class="text-pre-wrap" v-else-if="Serializer.isArray(message)"
    >[<template v-for="(msg, index) in message.value" :key="index"
      ><component :is="'LogMessageSerializer'" :message="msg" />{{
        message.value.length - 1 === index ? "" : ","
      }}</template
    >
    ]
  </span>

  <span class="text-pre-wrap" v-else-if="Serializer.isObject(message)">
    {{ leading ? "" : " " }}
    {{ "{" }}
    <template v-for="([key, value], index) in message.value" :key="index">
      <component :is="'LogMessageSerializer'" :message="key" />:
      <component :is="'LogMessageSerializer'" :message="value" />{{ message.value.length - 1 === index ? "" : "," }}
    </template>
    {{ "}" }}
  </span>

  <span v-else-if="Serializer.isMap(message)">
    Map({{ message.value.length }}) (
    <template v-for="(msg, index) in message.value" :key="index">
      <component :is="'LogMessageSerializer'" :message="Serializer.ofType('Array', msg)" />{{
        message.value.length - 1 === index ? "" : ", "
      }}</template
    >)
  </span>

  <span v-else-if="Serializer.isSet(message)">
    Set({{ message.value.length }})
    <component :is="'LogMessageSerializer'" :message="Serializer.ofType('Array', message.value)" />
  </span>

  <div v-else>Unknown({{ message.value }})</div>
</template>

<script lang="ts">
import type { PropType } from "vue";

import { IndexedDBClient } from "@/clients";

export default {
  name: "LogMessageSerializer",
  props: {
    message: Object as PropType<any>,
    leading: { type: Boolean, default: () => false },
  },
  setup() {
    return {
      Serializer: IndexedDBClient.serializer,
    };
  },
};
</script>
