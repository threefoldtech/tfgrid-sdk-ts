<template>
  <ScriptEditor />
</template>

<script lang="ts">
import ScriptEditor from "../components/ScriptEditor.vue";
export default {
  name: "TFScriptEditor",
  components: {
    ScriptEditor,
  },
  setup() {
    return {
      ScriptEditor,
    };
  },
};
</script>
