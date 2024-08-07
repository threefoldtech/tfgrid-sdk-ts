<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-title="title"
    item-value="key"
    hover
    hide-default-footer
    show-select
    v-model="selectedItems"
    hide-no-data
    :return-object="returnObject"
    @update:options="selectedItems = []"
    v-bind="$attrs"
  >
    <template #[`header.data-table-select`]>
      <div class="d-flex align-center justify-space-between">
        <span>#</span>
        <div class="d-flex">
          <v-checkbox-btn
            :model-value="selectedItems.length > 0 && selectedItems.length === items.length"
            :indeterminate="selectedItems.length > 0 && items.length !== selectedItems.length"
            :disabled="deleting || loading"
            @change="onUpdateSelection"
          />
        </div>
      </div>
    </template>

    <template #[`item.data-table-select`]="{ item, index }">
      <div class="d-flex align-center justify-space-between">
        <span>{{ index + 1 }}</span>
        <div class="d-flex" @click.stop>
          <v-progress-circular
            v-if="deleting && selectedItems.includes(item)"
            class="ml-3"
            color="error"
            :width="2"
            :size="20"
            indeterminate
          />
          <v-checkbox-btn
            v-else
            color="primary"
            :disabled="deleting || loading"
            :model-value="selectedItems.includes(item)"
            @update:model-value="toggleSelect(item)"
          />
        </div>
      </div>
    </template>

    <!-- Forward slots to the host component -->
    <template v-for="slot in (Object.keys($slots) as any[])" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <template
      #bottom
      v-if="
        deleting ||
        (loading && items.length === 0) ||
        (!loading && items.length === 0 && (noDataText || $slots['no-data-text']))
      "
    >
      <v-row class="my-5" v-if="loading && items.length === 0">
        <v-spacer />
        <div class="d-flex my-6 align-center justify-center">
          <v-progress-circular indeterminate :width="3" :size="30" />
        </div>
        <v-spacer />
      </v-row>
      <template v-else-if="!loading && items.length === 0 && (noDataText || $slots['no-data-text'])">
        <VContainer>
          <VRow justify="center" align="center" class="my-5">
            <slot name="no-data-text" v-if="$slots['no-data-text']" />
            <p v-else v-text="noDataText" />
          </VRow>
        </VContainer>
      </template>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { type PropType, ref, watch } from "vue";

import type { VDataTableHeader } from "../types";

export default {
  name: "ListTable",
  props: {
    headers: { type: Object as PropType<VDataTableHeader>, required: true },
    items: { type: Array as PropType<any[]>, required: true },
    loading: { type: Boolean, required: true },
    deleting: { type: Boolean, required: true },
    modelValue: { type: Array as PropType<any[]>, required: true },
    noDataText: String,
    returnObject: Boolean,
  },
  // inheritAttrs: true will allow to use @click:row from <ListTable @click:row="listener" />
  // by default it's true but added he to make it clear
  inheritAttrs: true,
  emit: { "update:model-value": (value: any[]) => value },
  setup(props, { emit }) {
    const selectedItems = ref<any[]>([]);
    watch(selectedItems, is => emit("update:model-value", is));

    function onUpdateSelection() {
      if (selectedItems.value.length === props.items.length) {
        selectedItems.value = [];
      } else {
        selectedItems.value = props.items.slice();
      }
    }

    watch(
      () => props.modelValue,
      is => {
        selectedItems.value = is;
      },
    );

    function toggleSelect(item: any) {
      if (selectedItems.value.includes(item)) {
        selectedItems.value = selectedItems.value.filter(i => i !== item);
      } else {
        selectedItems.value = [...selectedItems.value, item];
      }
    }

    return { selectedItems, onUpdateSelection, toggleSelect };
  },
};
</script>
