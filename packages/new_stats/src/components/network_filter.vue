<template>
  <v-row class="d-flex pt-4">
    <v-col class="d-flex justify-start py-0 align-center">
      <div v-for="(network, index) in networks" :key="index" style="min-width: fit-content" class="px-2">
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
      <v-btn
        flat
        variant="outlined"
        :loading="loading"
        color="secondary"
        prepend-icon="mdi-reload"
        @click="emits('refresh')"
      >
        <p class="font-weight-bold text-capitalize">Refresh</p>
      </v-btn>
    </v-col>
    <v-divider :thickness="1" class="border-opacity-50 pb-4" color="gray"></v-divider>
  </v-row>
</template>

<script lang="ts" setup>
import { Network } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";

const networks = ref([
  { label: "Dev", value: true },
  { label: "Main", value: true },
  { label: "Test", value: true },
]);
defineProps({
  loading: Boolean,
});
const emits = defineEmits<{
  (events: "update:modelValue", value?: string[]): void;
  (events: "refresh"): void;
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
