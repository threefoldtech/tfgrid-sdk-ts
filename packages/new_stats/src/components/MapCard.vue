<template>
  <div>testing stats</div>
</template>
<script setup lang="ts">
import { Network } from "@threefold/gridproxy_client";
import { onMounted } from "vue";

import { NetworkStats } from "../utils/fetchData";
onMounted(() => console.log(NetworkStats([Network.Dev])));
</script>
<script lang="ts">
export default {
  name: "MapCard",
};
</script>
