<template>
  <button @click="locationsTask.run()">run</button>
  {{ locationsTask }}
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import { useAsync } from "../../hooks";
import { getLocations } from "../../utils/nodeSelector";

export default {
  name: "TfSelectLocation",
  setup() {
    const locationsTask = useAsync(getLocations, { init: true });

    return { locationsTask };
  },
};
</script>
