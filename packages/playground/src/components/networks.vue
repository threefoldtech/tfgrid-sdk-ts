<template>
  <v-expansion-panels variant="inset" class="mb-4">
    <v-expansion-panel expand-icon="mdi-menu-down" collapse-icon="mdi-menu-up">
      <template v-slot:title>
        <span class="text-h6">Network</span>
        <v-chip v-if="error" variant="text">
          <v-icon color="warning" icon="mdi-alert-circle" />
        </v-chip>
        <v-chip v-if="ipv4" variant="outlined" size="small" class="ml-2"> IPV4 </v-chip>
        <v-chip v-if="ipv6" variant="outlined" size="small" class="ml-2"> IPV6 </v-chip>
        <v-chip v-if="planetary" variant="outlined" size="small" class="ml-2"> Planetary </v-chip>
        <v-chip v-if="wireguard" variant="outlined" size="small" class="ml-2"> Wireguard </v-chip>
      </template>
      <v-expansion-panel-text>
        <v-switch
          v-if="ipv4 !== null"
          hide-details
          color="primary"
          inset
          label="Public IPv4"
          :model-value="$props.ipv4"
          @update:model-value="$emit('update:ipv4', $event)"
        />
        <v-switch
          v-if="ipv6 !== null"
          hide-details
          color="primary"
          inset
          label="Public IPv6"
          :modelValue="$props.ipv6"
          @update:modelValue="$emit('update:ipv6', $event)"
        />
        <v-switch
          v-if="planetary !== null"
          hide-details
          color="primary"
          inset
          label="Planetary Network"
          :modelValue="$props.planetary"
          @update:modelValue="$emit('update:planetary', $event)"
        />
        <v-switch
          v-if="wireguard !== null"
          hide-details
          color="primary"
          inset
          label="Add Wireguard Access"
          :modelValue="$props.wireguard"
          @update:modelValue="$emit('update:wireguard', $event)"
        />
        <v-alert v-show="error" class="mb-2" type="warning" variant="tonal">
          You must enable at least one of network options.
        </v-alert>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { computed } from "vue";
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
    wireguard: {
      type: Boolean,
      default: () => null,
    },
  },
  emits: {
    "update:ipv4": (value?: boolean) => value,
    "update:ipv6": (value?: boolean) => value,
    "update:planetary": (value?: boolean) => value,
    "update:wireguard": (value?: boolean) => value,
  },
  setup(props, { expose }) {
    if (props.ipv4 === null && props.ipv6 === null && props.planetary === null && props.wireguard === null) {
      throw new Error("You must provide at least one network  option");
    }
    const error = computed(() => !(props.ipv4 || props.ipv6 || props.planetary || props.wireguard) && props.required);
    expose({
      error,
    });

    return {
      error,
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
