<template>
  <span>
    <v-tooltip location="bottom" text="Add a public config">
      <template #activator="{ props }">
        <v-icon
          class="mx-1"
          v-bind="props"
          size="large"
          :disabled="isAdding"
          :loading="isAdding"
          @click="showDialogue = true"
        >
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
              <!-- IPv4 -->
              <input-validator
                :value="config.ipv4"
                :rules="[validators.required('IPv4 is required.'), validators.isIPRange('IP is not valid.', 4)]"
                #="{ props }"
              >
                <input-tooltip tooltip="IPv4 address in CIDR format xx.xx.xx.xx/xx">
                  <v-text-field v-model="config.ipv4" v-bind="props" outlined label="IPv4"></v-text-field>
                </input-tooltip>
              </input-validator>

              <!-- Gateway IPv4 -->
              <input-validator
                :value="config.gw4"
                :rules="[
                  validators.required('Gateway is required.'),
                  validators.isIP('Gateway is not valid.', 4),
                  value =>
                    validators.ipNotEqualGateway(
                      config.ipv4,
                      config.gw4,
                      'Gateway IPv4 should not be equal to IPv4.',
                    )(value),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in IPv4 format">
                  <v-text-field v-model="config.gw4" v-bind="props" outlined label="Gateway IPv4"></v-text-field>
                </input-tooltip>
              </input-validator>

              <!-- IPv6 -->
              <input-validator
                :value="config.ipv6"
                :rules="[
                  value => (config.gw6 !== '' ? validators.required('IPv6 is required.')(value) : '') as RuleReturn,
                  value => validators.isIPRange('IP is not valid.', 6)(value),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="IPv6 address in format x:x:x:x:x:x:x:x">
                  <v-text-field v-model="config.ipv6" v-bind="props" outlined label="IPv6"></v-text-field>
                </input-tooltip>
              </input-validator>

              <!-- Gateway IPv6 -->
              <input-validator
                :value="config.gw6"
                :rules="[
                  value => (config.ipv6 !== '' ? validators.required('Gateway is required.')(value) : '') as RuleReturn,
                  value => validators.isIP('Gateway is not valid.', 6)(value),
                  value => validators.ipNotEqualGateway(
                    config.ipv6!,
                    config.gw6!,
                    'Gateway IPv6 should not be equal to IPv6.',
                  )(value),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Gateway for the IP in IPv6 format">
                  <v-text-field v-model="config.gw6" v-bind="props" outlined label="Gateway IPv6"></v-text-field>
                </input-tooltip>
              </input-validator>

              <!-- Domain -->
              <input-validator
                :value="config.domain"
                :rules="[domain => validators.isURL('Wrong domain format.')(domain)]"
                #="{ props }"
              >
                <input-tooltip tooltip="Domain for web gateway">
                  <v-text-field v-model="config.domain" v-bind="props" outlined label="Domain"></v-text-field>
                </input-tooltip>
              </input-validator>
            </form-validator>
          </div>
          <v-card-actions class="justify-space-between px-5 pb-5 pt-0">
            <!-- Remove and Generate Config Buttons -->
            <v-btn
              @click="isNodeHasConfig"
              color="error"
              variant="outlined"
              :disabled="isRemoving || Object.values(config).every(value => value == '')"
            >
              Remove Config
            </v-btn>

            <!-- Close and Save Buttons -->
            <div>
              <v-btn @click="showDialogue = false" variant="outlined" color="anchor">Close</v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                @click="AddConfig"
                :loading="isSaving"
                :disabled="isSaving || !valid || (valid && !isConfigChanged)"
              >
                Save
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <!-- Remove Config Dialog -->
    <template v-if="showClearDialogue">
      <v-dialog v-model="showClearDialogue" width="650">
        <v-card>
          <v-toolbar color="primary" dark class="custom-toolbar">
            <p class="mb-5">Remove Public Config</p>
          </v-toolbar>
          <v-card-text>Are you sure you want to remove this node's public config? </v-card-text>

          <v-card-actions class="justify-end px-5 pb-5 pt-0">
            <!-- Cancel and Remove Buttons -->
            <v-btn text="Cancel" color="anchor" variant="outlined" @click="showClearDialogue = false"></v-btn>
            <v-btn
              text="Remove"
              color="error"
              variant="outlined"
              :loading="isRemoving"
              :disabled="isRemoving"
              @click="removeConfig()"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </span>
</template>

<script lang="ts">
import type { PublicConfig } from "@threefold/grid_client";
import { isEqual } from "lodash";
import { onMounted, ref, watch } from "vue";

import type { RuleReturn } from "@/components/input_validator.vue";
import { useFormRef } from "@/hooks/form_validator";
import { useGrid } from "@/stores";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

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
  },

  setup(props, context) {
    const showDialogue = ref(false);
    const isAdding = ref(false);
    const valid = ref(false);
    const showClearDialogue = ref(false);
    const isRemoving = ref(false);
    const isSaving = ref(false);
    const isConfigChanged = ref(false);
    const formRef = useFormRef();
    const grid = useGrid();

    const defualtNodeConfig = ref<PublicConfig>(publicConfigInitializer());
    const config = ref<PublicConfig>(publicConfigInitializer());

    function publicConfigInitializer(): PublicConfig {
      return { ipv4: "", ipv6: "", gw4: "", gw6: "", domain: "" };
    }

    onMounted(async () => {
      await getPublicConfig();
    });

    watch(
      () => ({ ...config.value }),
      (old, newValue) => {
        isConfigChanged.value =
          !isEqual(defualtNodeConfig.value, config.value) ||
          (!isEqual(defualtNodeConfig.value, config.value) && !isEqual(old, newValue));
        formRef.value?.validate();
      },
    );

    async function getPublicConfig() {
      try {
        const node = await grid.client.nodes.get({ id: props.nodeId });

        if (node.publicConfig) {
          defualtNodeConfig.value = {
            ipv4: node.publicConfig.ip4 ? node.publicConfig.ip4.ip : "",
            gw4: node.publicConfig.ip4 ? node.publicConfig.ip4.gw : "",
            ipv6: node.publicConfig.ip6 ? node.publicConfig.ip6.ip : "",
            gw6: node.publicConfig.ip6 ? node.publicConfig.ip6.gw : "",
            domain: node.publicConfig.domain ? node.publicConfig.domain : "",
          };
          config.value = { ...defualtNodeConfig.value };
        }
      } catch (error) {
        createCustomToast(`Failed to get node: ${error}.`, ToastType.danger);
      }
    }

    async function AddConfig() {
      try {
        isSaving.value = true;
        await grid.client.nodes.addNodePublicConfig({
          farmId: props.farmId,
          nodeId: props.nodeId,
          publicConfig: {
            ip4: { ip: config.value.ipv4, gw: config.value.gw4 },
            ip6:
              config.value.ipv6 && config.value.gw6
                ? { ip: config.value.ipv6 as string, gw: config.value.gw6 as string }
                : null,
            domain: config.value.domain || null,
          },
        });
        createCustomToast("Public config saved successfully.", ToastType.success);
        context.emit("add-config", config.value);
        getPublicConfig();
        showDialogue.value = false;
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
        await grid.client.nodes.addNodePublicConfig({
          farmId: props.farmId,
          nodeId: props.nodeId,
        });
        createCustomToast("Public config removed successfully.", ToastType.success);
        defualtNodeConfig.value = config.value = publicConfigInitializer();
        context.emit("remove-config", config.value);
        showDialogue.value = false;
        config.value = publicConfigInitializer();
      } catch (error) {
        console.log(error);
        createCustomToast(`Failed to remove config. ${error}`, ToastType.danger);
      } finally {
        isRemoving.value = false;
        showClearDialogue.value = false;
      }
    }

    function isNodeHasConfig() {
      if (!Object.values(defualtNodeConfig.value).every(value => value == "")) {
        showClearDialogue.value = true;
        return;
      }
      config.value = defualtNodeConfig.value;
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
      isNodeHasConfig,
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
