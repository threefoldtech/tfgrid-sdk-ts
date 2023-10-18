<template>
  <v-row class="d-flex pt-4">
    <v-col class="d-flex justify-start py-0 align-center">
      <div v-for="(network, index) in networks" :key="index" class="px-2">
        <v-switch
          hide-details
          color="primary"
          :model-value="network.value"
          @update:model-value="updateNetworks($event, index)"
          inset
          :label="network.label + ' Nodes'"
        />
      </div>
    </v-col>
    <v-col class="d-flex justify-end pb-0">
      <v-btn flat color="blue" prepend-icon="mdi-reload" text="Refresh"></v-btn>
    </v-col>
    <v-divider :thickness="2" class="border-opacity-50 pb-4" color="gray"></v-divider>
  </v-row>
</template>

<script lang="ts" setup>
import { Network } from "@threefold/gridproxy_client";
import { onMounted, type Ref, ref } from "vue";

const networks = ref([
  { label: "Dev", value: true },
  { label: "Main", value: true },
  { label: "Test", value: true },
]);
const emits = defineEmits<{
  (events: "update:modelValue", value?: string[]): void;
}>();
const selectedNetworks = ref([Network.Dev, Network.Main, Network.Test]);
function updateNetworks(event: Event | undefined, index: number) {
  const network = networks.value[index].label.toLowerCase() as Network;
  if (event) {
    if (!selectedNetworks.value.includes(network)) {
      selectedNetworks.value.push(network);
    }
    networks.value[index].value = true;
  } else {
    if (selectedNetworks.value.includes(network)) {
      selectedNetworks.value.forEach((element, index) => {
        if (network == element) selectedNetworks.value.splice(index, 1);
      });
    }
    networks.value[index].value = false;
  }
  emits("update:modelValue", selectedNetworks.value);
}
onMounted(() => emits("update:modelValue", selectedNetworks.value));
</script>
<script lang="ts">
export default {
  name: "networkFilter",
};
</script>

<style></style>
