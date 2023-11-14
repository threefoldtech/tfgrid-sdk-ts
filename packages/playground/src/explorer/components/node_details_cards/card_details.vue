<template>
  <v-card :loading="loading">
    <v-alert class="pa-5" style="height: 20px" color="primary">
      <h4 class="text-center font-weight-medium">
        <v-icon :icon="icon" size="large" />
        {{ title }}
      </h4>
    </v-alert>
    <v-card-item :class="`mt-2 mb-2 ${$props.isMap ? 'map' : ''}`">
      <div v-if="$props.isMap">
        <tf-map :nodes="transformedObject" r="76" g="187" b="217"></tf-map>
      </div>

      <div :class="`items`" v-else>
        <slot name="gpu-hint-message" />

        <v-row class="bb-gray" v-for="item in items" :key="item.name">
          <v-col class="d-flex justify-start align-center ml-3">
            <p class="font-14">{{ item.name }}</p>
            <v-chip class="ml-4" v-if="item.nameHint" :color="item.nameHintColor">{{ item.nameHint }}</v-chip>
          </v-col>
          <v-col class="d-flex justify-end align-center mr-3">
            <p class="font-14" v-if="!item.icon && !item.hint && !item.imgSrc">
              {{ item.value && item.value.length > maxLenChar ? item.value.slice(0, maxLenChar) + "..." : item.value }}
            </p>

            <v-tooltip v-if="item.hint && !item.icon" location="top" :text="item.hint">
              <template #activator="{ props }">
                <p class="font-14" v-bind="props">
                  {{
                    item.value && item.value.length > maxLenChar ? item.value.slice(0, maxLenChar) + "..." : item.value
                  }}
                </p>
              </template>
            </v-tooltip>

            <v-tooltip v-if="item.hint && item.icon" location="top" :text="item.hint">
              <template #activator="{ props }">
                <p class="font-14" v-bind="props">
                  {{
                    item.value && item.value.length > maxLenChar ? item.value.slice(0, maxLenChar) + "..." : item.value
                  }}
                </p>
                <v-icon
                  v-if="item.value && item.value.length"
                  class="ml-1"
                  v-bind="props"
                  :icon="item.icon"
                  @click="item.callback!(item.value!)"
                />
              </template>
            </v-tooltip>

            <v-tooltip location="top" v-else-if="item.imgSrc" :text="item.hint">
              <template #activator="{ props }">
                <img alt="flag" width="40" v-bind="props" :src="item.imgSrc" />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>
    </v-card-item>
  </v-card>
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { capitalize, onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

export default {
  name: "CardDetails",
  props: {
    title: {
      type: String,
      required: true,
    },

    icon: {
      type: String,
      required: true,
    },
    node: {
      type: Object as PropType<GridNode>,
      required: false,
    },

    items: {
      type: Array as PropType<NodeDetailsCard[]>,
      required: false,
    },

    loading: {
      type: Boolean,
      required: true,
    },

    isMap: {
      type: Boolean,
      required: false,
    },
  },
  setup(props) {
    const maxLenChar = 30;
    const transformedObject = ref<string>("");

    onMounted(() => {
      if (props.node) {
        const country = capitalize(props.node.country);
        transformedObject.value = JSON.stringify({
          [country]: 1,
        });
      }
    });

    return { maxLenChar, transformedObject };
  },
};
</script>

<style scoped>
.bb-gray {
  border-bottom: 1px solid gray;
}
.map {
  /* width: 70%; */
  overflow: hidden;
  display: flex;
  justify-content: center;
}
</style>
