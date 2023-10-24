<template>
  <v-row class="d-flex pt-4 align-center">
    <v-col
      order-xl="last"
      order-lg="last"
      cols="12"
      lg="6"
      xl="6"
      class="d-flex justify-lg-end justify-xl-end justify-center pb-2 align-center"
    >
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
    <v-col
      cols="12"
      lg="6"
      xl="6"
      class="d-flex justify-end justify-lg-start justify-xl-start flex-wrap py-0 align-center"
    >
      <v-col
        cla
        cols="12"
        lg="3"
        xl="3"
        v-for="(network, index) in networks"
        :key="index"
        class="py-0 px-1 d-flex text-center justify-center"
      >
        <div class="pa-0">
          <v-switch
            style="min-width: fit-content"
            hide-details
            color="primary"
            :model-value="network.value"
            @update:model-value="updateNetworks($event, index)"
            inset
            :label="network.label + ' Nodes'"
          />
        </div>
      </v-col>
    </v-col>
  </v-row>
  <v-divider :thickness="1" class="border-opacity-50 mt-4" color="gray"></v-divider>

  <!--warning dialog-->
  <v-dialog v-model="filterError" width="auto">
    <v-alert
      closable
      text="You should select one network at least"
      color="#3C351D"
      class="text-warning"
      type="warning"
      @click:close="filterError = false"
    ></v-alert>
  </v-dialog>
</template>

<script lang="ts" setup>
import { Network } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";
defineProps({
  loading: Boolean,
});

const emits = defineEmits<{
  (events: "update:modelValue", value?: string[]): void;
  (events: "refresh"): void;
}>();
const filterError = ref(false);

const networks = ref([
  { label: "Dev", value: true },
  { label: "Main", value: true },
  { label: "Test", value: true },
]);

// initial state; all network selected
const selectedNetworks = ref([Network.Dev, Network.Main, Network.Test]);

onMounted(() => emits("update:modelValue", selectedNetworks.value));

function updateNetworks(event: Event | undefined, index: number) {
  const network = networks.value[index].label.toLowerCase() as Network;
  if (event) {
    if (!selectedNetworks.value.includes(network)) {
      selectedNetworks.value.push(network);
    }
    networks.value[index].value = true;
  } else {
    if (selectedNetworks.value.includes(network)) {
      if (selectedNetworks.value.length <= 1) {
        filterError.value = true;
        return;
      }
      selectedNetworks.value.forEach((element, index) => {
        if (network == element) selectedNetworks.value.splice(index, 1);
      });
    }
    networks.value[index].value = false;
  }
  emits("update:modelValue", selectedNetworks.value);
}
</script>
<script lang="ts">
export default {
  name: "networkFilter",
};
</script>

<style>
.v-overlay__scrim {
  background: black;
  opacity: 0.6;
}
</style>
