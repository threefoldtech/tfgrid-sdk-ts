<template>
  <div ref="input">
    <input-tooltip tooltip="Enable the network options to be able access your deployment">
      <v-expansion-panels variant="inset" class="mb-4">
        <v-expansion-panel expand-icon="mdi-menu-down" collapse-icon="mdi-menu-up" :disabled="$props.disabled">
          <template v-slot:title>
            <span class="text-h6">Network</span>
            <v-chip v-if="error" variant="text">
              <v-icon color="warning" icon="mdi-alert-circle" />
            </v-chip>
            <v-chip v-if="ipv4" variant="outlined" class="ml-2"> IPV4 </v-chip>
            <v-chip v-if="ipv6" variant="outlined" class="ml-2"> IPV6 </v-chip>
            <v-chip v-if="planetary" variant="outlined" class="ml-2"> Planetary </v-chip>
            <v-chip v-if="mycelium" variant="outlined" class="ml-2"> Mycelium </v-chip>
            <v-chip v-if="wireguard" variant="outlined" class="ml-2"> Wireguard </v-chip>
          </template>
          <v-expansion-panel-text>
            <input-tooltip
              v-if="ipv4 !== null"
              inline
              tooltip="An Internet Protocol version 4 address that is globally unique and accessible over the internet."
            >
              <v-switch
                hide-details
                color="primary"
                inset
                label="Public IPv4"
                :disabled="isDiscourse"
                :model-value="$props.ipv4"
                @update:model-value="$emit('update:ipv4', $event ?? undefined)"
              />
            </input-tooltip>
            <input-tooltip
              v-if="ipv6 !== null"
              inline
              tooltip="Public IPv6 is the next-generation Internet Protocol that offers an expanded address space to connect a vast number of devices."
            >
              <v-switch
                hide-details
                color="primary"
                inset
                label="Public IPv6"
                :modelValue="$props.ipv6"
                @update:modelValue="$emit('update:ipv6', $event ?? undefined)"
              />
            </input-tooltip>
            <input-tooltip
              v-if="planetary !== null"
              inline
              tooltip="The Planetary Network is a distributed network infrastructure that spans across multiple regions and countries, providing global connectivity."
            >
              <v-switch
                hide-details
                color="primary"
                inset
                label="Planetary Network"
                :modelValue="$props.planetary"
                @update:modelValue="$emit('update:planetary', $event ?? undefined)"
              />
            </input-tooltip>
            <input-tooltip
              v-if="mycelium !== null"
              inline
              tooltip="Mycelium is an IPv6 overlay network. Each node that joins the overlay network will receive an overlay network IP."
            >
              <v-switch
                hide-details
                color="primary"
                inset
                label="mycelium"
                :modelValue="$props.mycelium"
                @update:modelValue="$emit('update:mycelium', $event ?? undefined)"
              />
            </input-tooltip>
            <input-tooltip
              v-if="wireguard !== null"
              inline
              tooltip="Enabling WireGuard Access allows you to establish private, secure, and encrypted connections to your instance."
            >
              <v-switch
                hide-details
                color="primary"
                inset
                label="Add Wireguard Access"
                :modelValue="$props.wireguard"
                @update:modelValue="$emit('update:wireguard', $event ?? undefined)"
              />
            </input-tooltip>
            <v-alert v-show="error" class="mb-2" type="warning" variant="tonal">
              You must enable at least one of network options.
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </input-tooltip>
  </div>
</template>

<script lang="ts">
import { noop } from "lodash";
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch } from "vue";

import { useForm, ValidatorStatus } from "@/hooks/form_validator";
import type { InputValidatorService } from "@/hooks/input_validator";

export default {
  name: "Network",
  props: {
    required: {
      type: Boolean,
      default: () => false,
    },
    ipv4: {
      type: Boolean,
      default: () => null,
    },
    ipv6: {
      type: Boolean,
      default: () => null,
    },
    planetary: {
      type: Boolean,
      default: () => null,
    },
    mycelium: {
      type: Boolean,
      default: () => null,
    },
    wireguard: {
      type: Boolean,
      default: () => null,
    },
    disabled: { type: Boolean },
    isDiscourse: {
      type: Boolean,
      default: () => null,
    },
  },
  emits: {
    "update:ipv4": (value?: boolean) => value,
    "update:ipv6": (value?: boolean) => value,
    "update:planetary": (value?: boolean) => value,
    "update:mycelium": (value?: boolean) => value,
    "update:wireguard": (value?: boolean) => value,
  },
  setup(props, { expose }) {
    const input = ref();

    if (
      props.ipv4 === null &&
      props.ipv6 === null &&
      props.planetary === null &&
      props.wireguard === null &&
      props.mycelium === null
    ) {
      throw new Error("You must provide at least one network  option");
    }
    const error = computed(
      () => !(props.ipv4 || props.ipv6 || props.planetary || props.wireguard || props.mycelium) && props.required,
    );
    expose({
      error,
    });

    /* Adapter to work with old code validation */
    const { uid } = getCurrentInstance() as { uid: number };
    const form = useForm();

    const fakeService: InputValidatorService = {
      validate: () => Promise.resolve(true),
      setStatus: noop,
      reset: noop,
      status: ValidatorStatus.Valid,
      error: null,
      $el: input,
      highlightOnError: true,
    };

    onMounted(() => form?.register(uid.toString(), fakeService));
    onUnmounted(() => form?.unregister(uid.toString()));

    watch(error, invalid => {
      fakeService.status = invalid ? ValidatorStatus.Invalid : ValidatorStatus.Valid;
      form?.updateStatus(uid.toString(), fakeService.status);
    });

    return {
      error,
      input,
    };
  },
};
</script>
<style>
.v-expansion-panel-title__overlay {
  opacity: 0.05;
}

.v-expansion-panel-title {
  padding: 13px 13px;
}
</style>
