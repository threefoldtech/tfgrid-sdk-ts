<template>
  <v-btn class="bg-primary text-subtitle-1 px-6 ml-2 mr-3" @click="showDialogue = true" :loading="loading"
    >Add IP</v-btn
  >
  <v-container>
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
                v-model="type"
                @update:model-value="$emit('update:type', $event)"
              ></v-select>
              <input-validator
                :value="publicIP"
                :rules="[validators.required('IP is required.'), validators.isIPRange('Not a valid IP'), ipcheck]"
                #="{ props }"
              >
                <input-tooltip tooltip="IP address in CIDR format xxx.xxx.xxx.xxx/xx">
                  <v-text-field
                    v-model="publicIP"
                    v-bind:="props"
                    outlined
                    type="text"
                    :label="type === IPType.single ? 'IP' : 'From IP'"
                    @update:model-value="$emit('update:PublicIP', $event)"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                v-if="type === IPType.range"
                :value="toPublicIP"
                :rules="[validators.required('IP is required.'), validators.isIPRange('Not a valid IP'), toIpCheck]"
                #="{ props }"
              >
                <input-tooltip tooltip="IP address in CIDR format xxx.xxx.xxx.xxx/xx">
                  <v-text-field
                    v-model="toPublicIP"
                    v-bind:="props"
                    type="text"
                    @update:model-value="$emit('update:toPublicIP', $event)"
                    outlined
                    label="To IP"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>
              <input-validator
                :value="gateway"
                :rules="[
                  validators.required('Gateway is required.'),
                  validators.isIP('Gateway is not valid.'),
                  gatewayCheck,
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in ipv4 format">
                  <v-text-field
                    v-model="gateway"
                    v-bind:="props"
                    type="text"
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
            <v-btn @click="showDialogue = false" variant="outlined" color="anchor">Close</v-btn>

            <v-btn variant="outlined" @click="showRange" :disabled="!valid || type === IPType.single || !toPublicIP"
              >Show IPs Range</v-btn
            >
            <v-btn
              variant="outlined"
              color="secondary"
              @click="addFarmIp($props.farmId, gateway)"
              @update:modelValue="$emit('update:isAdded', $event)"
              :loading="isAdding"
              :disabled="!valid || isAdding"
              >Add</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { TFChainErrors } from "@threefold/types";
import { getIPRange } from "get-ip-range";
import { default as PrivateIp } from "private-ip";
import { ref, watch } from "vue";

import { IPType } from "@/utils/types";

import { useGrid } from "../../stores";
import { createCustomToast, ToastType } from "../../utils/custom_toast";
export default {
  name: "AddIP",
  props: {
    farmId: {
      type: Number,
      required: true,
    },
  },
  setup(_, context) {
    const showDialogue = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const IPs = ref<string[]>();
    const items = ref<string[]>([IPType.single, IPType.range]);
    const type = ref(IPType.single);
    const publicIP = ref("");
    const loading = ref(false);
    const isAdded = ref(false);
    const isAdding = ref(false);
    const showIPs = ref(false);
    const toPublicIP = ref("");
    const gateway = ref("");

    function ipcheck() {
      if (PrivateIp(publicIP.value.split("/")[0])) {
        return {
          message: "IP is not public",
        };
      }
      return undefined;
    }

    watch(
      type,
      () => {
        publicIP.value = toPublicIP.value = gateway.value = "";
      },
      { deep: true },
    );

    function toIpCheck() {
      if (toPublicIP.value.split("/")[1] !== publicIP.value.split("/")[1]) {
        return {
          message: "Subnet is different.",
        };
      }

      if (
        parseInt(toPublicIP.value.split("/")[0].split(".")[3]) <= parseInt(publicIP.value.split("/")[0].split(".")[3])
      ) {
        return {
          message: "To IP must be bigger than From IP.",
        };
      }

      if (
        toPublicIP.value.substring(0, toPublicIP.value.lastIndexOf(".")) !=
        publicIP.value.substring(0, publicIP.value.lastIndexOf("."))
      ) {
        return {
          message: "IPs are not the same.",
        };
      }
      if (
        parseInt(toPublicIP.value.split("/")[0].split(".")[3]) -
          parseInt(publicIP.value.split("/")[0].split(".")[3]) +
          1 >
        16
      ) {
        return {
          message: "Range must not exceed 16.",
        };
      }
      if (PrivateIp(publicIP.value.split("/")[0])) {
        return {
          message: "IP is not public.",
        };
      }
      return undefined;
    }

    function gatewayCheck() {
      const startIP = publicIP?.value.split("/")[0];
      const lastIP = toPublicIP?.value.split("/")[0];

      if (startIP === gateway.value || lastIP === gateway.value) {
        return {
          message: "IPs cannot be the same.",
        };
      }

      if (type.value !== IPType.single) {
        const range = getIPRange(startIP, lastIP);
        if (range.includes(gateway.value)) {
          return {
            message: "The gateway IP shouldn't be in the IPs range.",
          };
        }
      }

      return undefined;
    }

    function showRange() {
      addIPs();
      showIPs.value = true;
    }

    function addIPs() {
      const sub = publicIP.value.split("/")[1];
      const start = publicIP.value.split("/")[0];
      let end = toPublicIP.value.split("/")[0];

      if (type.value === IPType.single) end = start;

      IPs.value = getIPRange(start, end);
      IPs.value.forEach((ip, i) => {
        IPs.value![i] = ip + "/" + sub;
      });
    }

    async function addFarmIp(farmId: number, gw: string) {
      try {
        isAdding.value = true;
        if (type.value === IPType.range) {
          addIPs();
        }
        if (IPs.value && IPs.value.length > 1) {
          const extrinsics: any[] = [];
          for (const ip in IPs.value) {
            extrinsics.push(
              await gridStore.grid.tfchain.tfClient.farms.addFarmIp({
                farmId,
                ip: IPs.value[ip],
                gw,
              }),
            );
          }
          await gridStore.grid.utility.batchAll({ extrinsics });
        } else {
          await gridStore.grid.farms.addFarmIp({
            farmId,
            ip: publicIP.value,
            gw,
          });
        }
        context.emit("ip-added-successfully");
        createCustomToast("IP is added successfully.", ToastType.success);
        showDialogue.value = false;
      } catch (error) {
        if (error instanceof TFChainErrors.tfgridModule.IpExists) {
          console.log(error);
          createCustomToast(`IP already exists.`, ToastType.danger);
        } else {
          console.log(error);
          createCustomToast(`Failed to add IP. ${error}`, ToastType.danger);
        }
      } finally {
        isAdding.value = false;
        reset();
      }
    }

    function reset() {
      publicIP.value = "";
      toPublicIP.value = "";
      gateway.value = "";
    }

    return {
      showDialogue,
      valid,
      IPs,
      items,
      loading,
      isAdded,
      isAdding,
      showIPs,
      IPType,
      showRange,
      addIPs,
      addFarmIp,
      ipcheck,
      toIpCheck,
      gatewayCheck,
      type,
      publicIP,
      toPublicIP,
      gateway,
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
