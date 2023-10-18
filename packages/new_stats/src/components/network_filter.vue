<template>
  <v-row class="d-flex pt-4">
    <v-col class="d-flex justify-start py-0 align-center">
      <div v-for="network in networks" :key="network.value" class="px-2">
        <v-switch
          hide-details
          color="primary"
          @update:model-value="updateNetworks($event, network.value)"
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
import { type Ref, ref } from "vue";

const networks = [
  { label: "Dev", value: Network.Dev },
  { label: "Main", value: Network.Main },
  { label: "Test", value: Network.Test },
];
const emits = defineEmits<{
  (events: "update:modelValue", value?: Network[]): void;
}>();
const selectedNetworks = ref([]) as Ref<Network[]>;
function updateNetworks(event: Event | undefined, network: Network) {
  if (event) {
    if (!selectedNetworks.value.includes(network)) {
      selectedNetworks.value.push(network);
    }
  } else {
    if (selectedNetworks.value.includes(network)) {
      selectedNetworks.value.forEach((element, index) => {
        if (network == element) selectedNetworks.value.splice(index, 1);
      });
    }
  }
  emits("update:modelValue", selectedNetworks.value);
}
</script>
<script lang="ts">
export default {
  name: "networkFilter",
};
</script>

<style></style>
