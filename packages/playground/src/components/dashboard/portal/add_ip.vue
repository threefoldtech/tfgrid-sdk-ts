<template>
  <v-container>
    <v-row>
      <v-btn color="blue" class="ml-auto bold-text" @click="showDialogue = true" :loading="loading">Add IP</v-btn>
    </v-row>

    <v-container v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" class="custom-toolbar">
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
                <input-tooltip tooltip="IP address in CIDR format xxx.xxx.xxx.xxx/xx">
                  <v-text-field
                    :model-value="$props.publicIP"
                    v-bind:="props"
                    @update:model-value="$emit('update:publicIP', $event)"
                    outlined
                    :label="type === IPType.single ? 'IP' : 'From IP'"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>
              <input-validator
                v-if="type === IPType.range"
                :value="$props.toPublicIP"
                :rules="[validators.required('IP is required.'), validators.isIPRange('Not a valid IP'), toIpCheck]"
                #="{ props }"
              >
                <input-tooltip tooltip="IP address in CIDR format xxx.xxx.xxx.xxx/xx">
                  <v-text-field
                    :model-value="$props.toPublicIP"
                    v-bind:="props"
                    @update:model-value="$emit('update:toPublicIP', $event)"
                    outlined
                    label="To IP"
                  ></v-text-field>
                </input-tooltip>
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
                <input-tooltip tooltip="Gateway for the IP in ipv4 format">
                  <v-text-field
                    :model-value="$props.gateway"
                    v-bind:="props"
                    @update:model-value="$emit('update:gateway', $event)"
                    outlined
                    label="Gateway"
                  ></v-text-field>
                </input-tooltip>
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
              :disabled="!valid || $props.type === IPType.single || !$props.toPublicIP"
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

import { IPType } from "@/utils/types";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";
export default {
  name: "AddIP",
  props: {
    farmId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    publicIP: {
      type: String,
      required: true,
    },
    toPublicIP: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const showDialogue = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const IPs = ref<string[]>();
    const items = ref<string[]>([IPType.single, IPType.range]);
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
      if (props.publicIP?.split("/")[0] === props.gateway || props.toPublicIP?.split("/")[0] === props.gateway) {
        return {
          message: "IPs cannot be the same.",
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

      if (props.type === IPType.single) end = start;

      IPs.value = getIPRange(start, end);
      IPs.value.forEach((ip, i) => {
        IPs.value![i] = ip + "/" + sub;
      });
    }

    async function addFarmIp(farmId: number, gw: string) {
      try {
        isAdding.value = true;
        if (props.type === IPType.range) {
          addIPs();
        }
        if (IPs.value && IPs.value.length > 1) {
          const extrinsics: any[] = [];
          for (const ip in IPs.value) {
            extrinsics.push(
              await gridStore.grid.tfchain.tfClient.farms.client.api.tx.tfgridModule.addFarmIp(
                farmId,
                IPs.value[ip],
                gw,
              ),
            );

            context.emit("add-publicIPs", [{ ip: IPs.value[ip], gateway: gw }]);
          }
          await gridStore.grid.utility.batchAll({ extrinsics });
        } else {
          await gridStore.grid.farms.addFarmIp({ farmId, ip: props.publicIP, gw });
          context.emit("add-publicIPs", [{ ip: props.publicIP, gateway: gw }]);
        }
        createCustomToast("IP is added successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast(`Failed to add IP. ${error}`, ToastType.danger);
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
      IPType,
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
