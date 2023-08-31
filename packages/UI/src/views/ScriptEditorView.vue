<template>
  <ScriptEditor dest />
</template>

<script lang="ts">
import { ref } from "vue";

import ScriptEditor from "../components/ScriptEditor.vue";
export default {
  name: "TFScriptEditor",
  components: {
    ScriptEditor,
  },
  setup() {
    const dest = ref();
    return {
      ScriptEditor,
      dest,
    };
  },
};
</script>
