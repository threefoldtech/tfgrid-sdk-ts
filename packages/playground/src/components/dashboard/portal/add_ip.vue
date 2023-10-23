<template>
  <v-container>
    <v-row>
      <v-btn color="blue" class="ml-auto bold-text" @click="showDialogue = true" :loading="loading">Add IP</v-btn>
    </v-row>

    <v-container v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">
            <p class="mb-5">Add Public IP to Farm</p>
          </v-toolbar>
          <div class="pa-6">
            <form-validator v-model="valid">
              <v-select
                :items="items"
                label="Choose how to enter IP"
                v-model="selectedItem"
                @update:model-value="$emit('update:type', $event)"
              ></v-select>
              <input-validator
                :value="$props.publicIP"
                :rules="[validators.required('IP is required.'), validators.isIPRange('Not a valid IP'), ipcheck]"
                #="{ props }"
              >
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
                :rules="[validators.required('IP is required.'), validators.isIPRange('Not a valid IP'), toIpCheck]"
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
                :rules="[
                  validators.required('Gateway is required.'),
                  validators.isIP('Gateway is not valid.'),
                  gatewayCheck,
                ]"
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
          <v-dialog v-model="showIPs" max-width="500">
            <v-card>
              <v-card-title class="text-h5">IPs range</v-card-title>
              <v-card-text v-for="(IP, i) in IPs" :key="IP">{{ i + 1 }}- {{ IP }}</v-card-text>
              <v-card-actions> </v-card-actions>
            </v-card>
          </v-dialog>

          <v-card-actions class="justify-end pa-5">
            <v-btn
              variant="tonal"
              color="primary"
              @click="addFarmIp($props.farmId, $props.gateway)"
              @update:modelValue="$emit('update:isAdded', $event)"
              :loading="isAdding"
              :disabled="!valid || isAdding"
              >Add</v-btn
            >
            <v-btn
              variant="tonal"
              @click="showRange"
              :disabled="!valid || $props.type === 'Single' || !$props.toPublicIP"
              >Show IPs Range</v-btn
            >
            <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { contains } from "cidr-tools";
import { getIPRange } from "get-ip-range";
import { default as PrivateIp } from "private-ip";
import { ref, watch } from "vue";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";

export default {
  name: "AddIP",
  props: ["farmId", "type", "publicIP", "toPublicIP", "gateway"],
  setup(props, context) {
    const showDialogue = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const IPs = ref<string[]>();
    const items = ref<string[]>(["Single", "Range"]);
    const selectedItem = ref(props.type);
    const loading = ref(false);
    const isAdded = ref(false);
    const isAdding = ref(false);
    const inRange = ref<boolean>();
    const showIPs = ref(false);

    watch(
      [() => props.publicIP, () => props.gateway],
      ([newPublicIP, newGateway], [_, _2]) => {
        try {
          inRange.value = contains(newPublicIP, newGateway);
        } catch (e) {
          inRange.value = false;
        }
        gatewayCheck();
      },
      { immediate: true },
    );

    function ipcheck() {
      if (PrivateIp(props.publicIP.split("/")[0])) {
        return {
          message: "IP is not public",
        };
      }
      return undefined;
    }

    function toIpCheck() {
      if (props.toPublicIP.split("/")[1] !== props.publicIP.split("/")[1]) {
        return {
          message: "Subnet is different.",
        };
      }

      if (
        parseInt(props.toPublicIP.split("/")[0].split(".")[3]) <= parseInt(props.publicIP.split("/")[0].split(".")[3])
      ) {
        return {
          message: "To IP must be bigger than From IP.",
        };
      }

      if (
        props.toPublicIP.substring(0, props.toPublicIP.lastIndexOf(".")) !=
        props.publicIP.substring(0, props.publicIP.lastIndexOf("."))
      ) {
        return {
          message: "IPs are not the same.",
        };
      }
      if (
        parseInt(props.toPublicIP.split("/")[0].split(".")[3]) - parseInt(props.publicIP.split("/")[0].split(".")[3]) >
        16
      ) {
        return {
          message: "Range must not exceed 16.",
        };
      }
      if (PrivateIp(props.publicIP.split("/")[0])) {
        return {
          message: "IP is not public.",
        };
      }
      return undefined;
    }

    function gatewayCheck() {
      if (!inRange.value) {
        return {
          message: "Gateway IP not in the provided IP range.",
        };
      }
      return undefined;
    }

    function showRange() {
      addIPs();
      showIPs.value = true;
    }

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

    async function addFarmIp(farmId: number, gw: number) {
      try {
        isAdding.value = true;
        if (props.type === "Range") {
          addIPs();
        }
        if (IPs.value && IPs.value.length > 1) {
          for (const ip in IPs) {
            await gridStore.grid.farms.addFarmIp({ farmId, ip: +ip, gw });
            context.emit("add-publicIPs", [{ ip: +ip, gw }]);
          }
        } else {
          await gridStore.grid.farms.addFarmIp({ farmId, ip: props.publicIP as number, gw });
          context.emit("add-publicIPs", [{ ip: props.publicIP, gw }]);
        }
        createCustomToast("IP is added successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to add IP.", ToastType.danger);
      } finally {
        isAdding.value = false;
      }
    }
    return {
      showDialogue,
      valid,
      IPs,
      items,
      selectedItem,
      loading,
      isAdded,
      isAdding,
      inRange,
      showIPs,
      showRange,
      addIPs,
      addFarmIp,
      ipcheck,
      toIpCheck,
      gatewayCheck,
    };
  },
};
</script>

<style scoped>
.custom-toolbar {
  height: 2.5rem !important;
  padding-left: 10px;
}
</style>
