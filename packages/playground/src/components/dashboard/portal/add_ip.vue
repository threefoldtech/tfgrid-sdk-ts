<template>
  <v-container>
    <v-row>
      <v-btn color="blue" class="ml-auto bold-text" @click="showDialogue = true" :loading="loading">Add IP</v-btn>
    </v-row>

    <v-container v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">Add Public IP to Farm</v-toolbar>
          <div class="pa-6">
            <form-validator v-model="valid">
              <v-select
                :items="items"
                label="Choose how to enter IP"
                item-title="name"
                item-value="id"
                v-model="selectedItem"
                @update:model-value="$emit('update:type', $event)"
              ></v-select>
              <input-validator :value="$props.publicIP" :rules="[validators.required('IP is required.')]" #="{ props }">
                <v-text-field
                  :model-value="$props.publicIP"
                  v-bind:="props"
                  @update:model-value="$emit('update:publicIP', $event)"
                  outlined
                  :label="type === 'Single' ? 'IP' : 'From IP'"
                ></v-text-field>
              </input-validator>
              <input-validator
                v-if="type === 'Range'"
                :value="$props.toPublicIP"
                :rules="[validators.required('IP is required.')]"
                #="{ props }"
              >
                <v-text-field
                  :model-value="$props.toPublicIP"
                  v-bind:="props"
                  @update:model-value="$emit('update:toPublicIP', $event)"
                  outlined
                  label="To IP"
                ></v-text-field>
              </input-validator>
              <input-validator
                :value="$props.gateway"
                :rules="[validators.required('Gateway is required.'), validators.isIP('Gateway is not valid.')]"
                #="{ props }"
              >
                <v-text-field
                  :model-value="$props.gateway"
                  v-bind:="props"
                  @update:model-value="$emit('update:gateway', $event)"
                  outlined
                  label="Gateway"
                ></v-text-field>
              </input-validator>
            </form-validator>
          </div>
          <v-card-actions class="justify-end pa-5">
            <v-btn
              variant="tonal"
              color="primary"
              @click="addFarmIp($props.farmId, $props.publicIP, $props.gateway)"
              @update:modelValue="$emit('update:isAdded', $event)"
              :disabled="!valid"
              >Add</v-btn
            >
            <v-btn variant="tonal" @click="addIPs" :disabled="!valid">Show IPs Range</v-btn>
            <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { getIPRange } from "get-ip-range";
import { ref } from "vue";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";

export default {
  name: "AddIP",
  props: ["farmId", "type", "publicIP", "toPublicIP", "gateway"],
  setup(props) {
    const showDialogue = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const IPs = ref<string[]>();
    const items = ref<string[]>(["Single", "Range"]);
    const selectedItem = ref(items.value[0]);
    const loading = ref(false);
    const isAdded = ref(false);

    function addIPs() {
      const sub = props.publicIP.split("/")[1];
      const start = props.publicIP.split("/")[0];
      let end = props.toPublicIP.split("/")[0];

      if (props.type === "Single") end = start;

      IPs.value = getIPRange(start, end);
      IPs.value.forEach((ip, i) => {
        IPs.value![i] = ip + "/" + sub;
      });
    }

    async function addFarmIp(farmId: number, ip: number, gw: number) {
      try {
        loading.value = true;
        await gridStore.grid.farms.addFarmIp({ farmId, ip, gw });
        createCustomToast("IP is added successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to add IP.", ToastType.danger);
      } finally {
        loading.value = false;
      }
    }
    return {
      showDialogue,
      valid,
      items,
      selectedItem,
      loading,
      isAdded,
      addIPs,
      addFarmIp,
    };
  },
};
</script>

<style scoped>
.custom-toolbar {
  font-size: 20px;
  font-weight: bold;
  padding-left: 10px;
}
</style>
