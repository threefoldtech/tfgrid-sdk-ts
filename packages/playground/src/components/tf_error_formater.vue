<template>
  <FormatedError :error="parsedError" />
</template>

<script lang="ts">
import { computed, type PropType, toRef } from "vue";

import FormatedError, { type ErrorToken } from "./formated_error.vue";

function parseError(error?: any): ErrorToken[] {
  const err = error || "";
  const parts: any[] = [];

  let open = 0;
  let part = "";
  for (const char of err) {
    if (char === "{" || char === "[") {
      if (open === 0 && part.length > 0) {
        parts.push(part);
        part = "";
      }
      part += char;
      open++;
    } else if (char === "}" || char === "]") {
      part += char;
      if (open === 1 && part.length > 0) {
        try {
          parts.push(JSON.parse(part));
        } catch {
          parts.push(part);
        }
        part = "";
      }
      open--;
    } else {
      part += char;
    }
  }

  if (part.length > 0) {
    parts.push(part);
  }

  const tokens: ErrorToken[] = [];

  const idRef = { id: 0 };
  for (const part of parts) {
    if (typeof part === "string") {
      tokens.push({ id: idRef.id++, type: "Literal", value: part });
    }

    if (typeof part === "object") {
      tokens.push(parseObject(idRef, part));
    }
  }

  return tokens;
}

function parseObject(idRef: { id: number }, obj: any): ErrorToken {
  if (Array.isArray(obj)) {
    return { id: idRef.id++, type: "Array", value: obj.map(x => parseObject(idRef, x)) };
  }

  if (typeof obj === "object" && obj) {
    return {
      id: idRef.id++,
      type: "Object",
      value: Object.keys(obj).reduce((res, key) => {
        res[key] = parseObject(idRef, obj[key]);
        return res;
      }, {} as any),
    };
  }

  return { id: idRef.id++, type: "Literal", value: String(obj) };
}

export default {
  name: "TfErrorFormater",
  components: { FormatedError },
  props: {
    error: { type: String as PropType<string | undefined | null>, required: true },
  },
  setup(_props) {
    const props = toRef(_props);
    const parsedError = computed(() => parseError(props.value.error));

    return { parsedError };
  },
};
</script>
