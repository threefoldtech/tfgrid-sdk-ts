<template>
  <span>
    <v-tooltip text="Add a public config">
      <template #activator="{ props }">
        <v-icon v-bind="props" size="small" :disabled="isAdding" :loading="isAdding" @click="showDialogue = true">
          mdi-earth
        </v-icon>
      </template>
    </v-tooltip>

    <template v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">
            <p class="mb-5">Add a public config to your node with ID: {{ $props.nodeId }}</p>
          </v-toolbar>
          <div class="pt-6 px-6">
            <form-validator v-model="valid" ref="formRef">
              <input-validator
                :value="$props.modelValue.ipv4"
                :rules="[validators.required('IPv4 is required.'), validators.isIPRange('IP is not valid.', 4)]"
                #="{ props }"
              >
                <input-tooltip tooltip="IPV4 address in CIDR format xx.xx.xx.xx/xx">
                  <v-text-field v-model="$props.modelValue.ipv4" v-bind="props" outlined label="IPv4"></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.modelValue.gw4"
                :rules="[validators.required('Gateway is required.'), validators.isIP('Gateway is not valid.', 4)]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in ipv4 format">
                  <v-text-field
                    v-model="$props.modelValue.gw4"
                    v-bind:="props"
                    outlined
                    label="Gateway IPv4"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>
              <input-validator
                :value="$props.modelValue.ipv6"
                :rules="[value => validators.isIPRange('IP is not valid.', 6)(value)]"
                #="{ props }"
              >
                <input-tooltip tooltip="IPV6 address in format x:x:x:x:x:x:x:x">
                  <v-text-field v-model="$props.modelValue.ipv6" v-bind:="props" outlined label="IPv6"></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.modelValue.gw6"
                :rules="[value => validators.isIP('Gateway is not valid.', 6)(value)]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in ipv6 format">
                  <v-text-field
                    v-model="$props.modelValue.gw6"
                    v-bind:="props"
                    outlined
                    label="Gateway IPv6"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.modelValue.domain"
                :rules="[domain => validators.isURL('Wrong domain format.')(domain)]"
                #="{ props }"
              >
                <input-tooltip tooltip="Domain for web gateway">
                  <v-text-field
                    v-model="$props.modelValue.domain"
                    v-bind:="props"
                    outlined
                    label="Domain"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>
            </form-validator>
          </div>
          <v-card-actions class="justify-space-between px-5 pb-5 pt-0">
            <v-btn
              @click="showClearDialogue = true"
              color="white"
              class="bg-red-lighten-1"
              :disabled="isRemoving || Object.values(config).every(value => value == '')"
              >Remove Config</v-btn
            >
            <div>
              <v-btn
                color="primary"
                variant="tonal"
                @click="AddConfig"
                :loading="isSaving"
                :disabled="isSaving || !valid || (!valid && !isConfigChanged)"
              >
                Save
              </v-btn>
              <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <template v-if="showClearDialogue">
      <v-dialog v-model="showClearDialogue" width="650">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">
            <p class="mb-5">Remove Public Config</p>
          </v-toolbar>
          <v-card-text> Are you certain you want to remove this node's public config? </v-card-text>
          <v-alert variant="tonal" type="warning" class="ma-4">
            <p>This action is reversible!</p>
          </v-alert>
          <v-card-actions class="justify-end px-5 pb-5 pt-0">
            <v-btn
              text="Remove"
              color="white"
              :loading="isRemoving"
              :disabled="isRemoving"
              class="bg-red-lighten-1"
              @click="removeConfig()"
            ></v-btn>
            <v-btn text="Close" @click="showClearDialogue = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </span>
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import _ from "lodash";
import { onMounted, type PropType, ref, watch } from "vue";

import { gridProxyClient } from "@/clients";
import { useFormRef } from "@/hooks/form_validator";
import type { IPublicConfig } from "@/utils/types";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";

export default {
  name: "AddPublicConfig",
  props: {
    nodeId: {
      type: Number,
      required: true,
    },
    farmId: {
      type: Number,
      required: true,
    },
    modelValue: {
      type: Object as PropType<IPublicConfig>,
      required: true,
    },
  },

  setup(props, context) {
    const showDialogue = ref(false);
    const isAdding = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const showClearDialogue = ref(false);
    const isRemoving = ref(false);
    const isSaving = ref(false);
    const config = ref();
    const isConfigChanged = ref(false);
    const formRef = useFormRef();

    onMounted(async () => {
      config.value = await getPublicConfig();
    });

    watch(
      () => ({ ...props.modelValue }),
      (old, newValue) => {
        isConfigChanged.value = !_.isEqual(old, newValue) && !_.isEqual(props.modelValue, config.value);
        formRef.value?.validate();
      },
    );

    async function getPublicConfig() {
      try {
        const node: GridNode = await gridProxyClient.nodes.byId(props.nodeId);
        const config = node.publicConfig;
        return config;
      } catch (error) {
        console.log(`Failed to get node: ${error}`);
      }
    }

    async function AddConfig() {
      try {
        isSaving.value = true;
        await gridStore.grid.nodes.addNodePublicConfig({
          farmId: props.farmId,
          nodeId: props.nodeId,
          publicConfig: {
            ip4: { ip: props.modelValue.ipv4, gw: props.modelValue.gw4 },
            ip6:
              {
                ip: props.modelValue.ipv6 as string,
                gw: props.modelValue.gw6 as string,
              } || undefined,
            domain: props.modelValue.domain || undefined,
          },
        });
        createCustomToast("Public config saved successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast(`Failed to save config. ${error}.`, ToastType.danger);
      } finally {
        isSaving.value = false;
      }
    }

    async function removeConfig() {
      try {
        isRemoving.value = true;
        await gridStore.grid.nodes.addNodePublicConfig({
          farmId: props.farmId,
          nodeId: props.nodeId,
          publicConfig: null,
        });
        createCustomToast("Public config removed successfully.", ToastType.success);
        setTimeout(() => {
          context.emit("remove-config");
        }, 5000);
      } catch (error) {
        console.log(error);
        createCustomToast(`Failed to remove config. ${error}`, ToastType.danger);
      } finally {
        isRemoving.value = false;
        showClearDialogue.value = false;
      }
    }
    return {
      showDialogue,
      isAdding,
      valid,
      showClearDialogue,
      isRemoving,
      isSaving,
      config,
      isConfigChanged,
      formRef,
      AddConfig,
      removeConfig,
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
