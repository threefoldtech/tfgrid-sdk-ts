<template>
  <ScriptEditor dest network />
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
    const dest = ref<string>();
    const network = ref<string>();
    return {
      ScriptEditor,
      dest,
      network,
    };
  },
};
</script>
