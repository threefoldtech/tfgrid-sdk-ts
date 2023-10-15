<template>
  <span>
    <v-tooltip text="Add a public config">
      <template #activator="{ props }">
        <v-icon v-bind="props" size="small" :disabled="isAdding" :loading="isAdding" @click="showDialogue = true">
          mdi-earth
        </v-icon>
      </template>
    </v-tooltip>

    <span v-if="showDialogue">
      <v-dialog v-model="showDialogue" max-width="600">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar"
            >Add a public config to your node with ID: {{ $props.nodeId }}</v-toolbar
          >
          <div class="pt-6 px-6">
            <form-validator v-model="valid">
              <input-validator
                :value="$props.publicConfig.ipv4"
                :rules="[validators.required('IPv4 is required.')]"
                #="{ props }"
              >
                <input-tooltip tooltip="IPV4 address in CIDR format xx.xx.xx.xx/xx">
                  <v-text-field
                    :model-value="$props.publicConfig.ipv4"
                    v-bind:="props"
                    @update:model-value="$emit('update:ipv4', $event)"
                    outlined
                    label="IPv4"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.publicConfig.gw4"
                :rules="[validators.required('Gateway is required.')]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in ipv4 format">
                  <v-text-field
                    :model-value="$props.publicConfig.gw4"
                    v-bind:="props"
                    @update:model-value="$emit('update:gw4', $event)"
                    outlined
                    label="Gateway"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.publicConfig.ipv6"
                :rules="[validators.required('IPv6 is required.')]"
                #="{ props }"
              >
                <input-tooltip tooltip="IPV6 address in format x:x:x:x:x:x:x:x">
                  <v-text-field
                    :model-value="$props.publicConfig.ipv6"
                    v-bind:="props"
                    @update:model-value="$emit('update:ipv6', $event)"
                    outlined
                    label="IPv6"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.publicConfig.gw6"
                :rules="[validators.required('Gateway is required.')]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in ipv6 format">
                  <v-text-field
                    :model-value="$props.publicConfig.gw6"
                    v-bind:="props"
                    @update:model-value="$emit('update:gw6', $event)"
                    outlined
                    label="Gateway"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="$props.publicConfig.domain"
                :rules="[validators.required('Domain is required.')]"
                #="{ props }"
              >
                <input-tooltip tooltip="Domain for web gateway">
                  <v-text-field
                    :model-value="$props.publicConfig.domain"
                    v-bind:="props"
                    @update:model-value="$emit('update:domain', $event)"
                    outlined
                    label="Domain"
                  ></v-text-field>
                </input-tooltip>
              </input-validator>
            </form-validator>
          </div>
          <v-card-actions class="justify-space-between px-5 pb-5 pt-0">
            <v-btn @click="showClearDialogue = true" color="white" class="bg-red-lighten-1">Remove Config</v-btn>
            <div>
              <v-btn color="primary" variant="tonal" @click="AddConfig" :disabled="!valid">Save</v-btn>
              <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </span>

    <template v-if="showClearDialogue">
      <v-dialog v-model="showClearDialogue" width="650">
        <v-card class="pa-4">
          <v-card-text> Are you certain you want to remove this node's public config? </v-card-text>
          <v-alert variant="tonal" type="warning" class="ma-4">
            <p>This action is reversible!</p>
          </v-alert>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text="Remove"
              color="white"
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
import { ref } from "vue";

import { useGrid } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";

export default {
  name: "AddPublicConfig",
  props: ["nodeId", "farmId", "publicConfig"],
  setup(props) {
    const showDialogue = ref(false);
    const isAdding = ref(false);
    const gridStore = useGrid();
    const valid = ref(false);
    const showClearDialogue = ref(false);
    const isRemoving = ref(false);
    async function AddConfig() {
      try {
        await gridStore.grid.nodes.addNodePublicConfig({
          farmId: props.farmId,
          nodeId: props.nodeId,
          publicConfig: {
            ip: props.publicConfig.ipv4,
            gw: props.publicConfig.gw4,
            ip6: props.publicConfig.ipv6,
            gw6: props.publicConfig.gw6,
            domain: props.publicConfig.domain,
          },
        });
        createCustomToast("Public config saved successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to save config!", ToastType.danger);
      }
    }

    async function removeConfig() {
      try {
        isRemoving.value = true;
        await gridStore.grid.nodes.addNodePublicConfig({
          farmId: props.farmId,
          nodeId: props.nodeId,
          publicConfig: {},
        });
        createCustomToast("Public config removed successfully.", ToastType.success);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to remove config!", ToastType.danger);
      } finally {
        isRemoving.value = false;
      }
    }
    return {
      showDialogue,
      isAdding,
      valid,
      showClearDialogue,
      isRemoving,
      AddConfig,
      removeConfig,
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
