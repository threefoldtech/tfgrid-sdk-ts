<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-title="title"
    item-value="key"
    hover
    :items-per-page="-1"
    hide-default-footer
    show-select
    v-model="selectedItems"
    hide-no-data
  >
    <template #[`column.data-table-select`]>
      <div class="d-flex align-center justify-space-between">
        <span>#</span>
        <div class="d-flex">
          <v-divider vertical class="ml-3 mr-1" />
          <v-checkbox-btn
            :model-value="selectedItems.length > 0 && selectedItems.length === items.length"
            :indeterminate="selectedItems.length > 0 && items.length !== selectedItems.length"
            :disabled="deleting || loading"
            @change="onUpdateSelection"
          />
        </div>
      </div>
    </template>

    <template #[`item.data-table-select`]="{ item, toggleSelect, index }">
      <div class="d-flex align-center justify-space-between">
        <span>{{ index + 1 }}</span>
        <div class="d-flex" @click.stop>
          <v-divider vertical class="ml-3 mr-1" />
          <v-progress-circular
            v-if="deleting && selectedItems.includes(item?.value)"
            class="ml-3"
            indeterminate
            color="red"
            :width="2"
            :size="20"
          />
          <v-checkbox-btn
            v-else
            color="primary"
            :disabled="deleting || loading"
            :model-value="selectedItems.includes(item.value)"
            @update:model-value="toggleSelect(item)"
          />
        </div>
      </div>
    </template>

    <!-- Forward slots to the host component -->
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <template #bottom>
      <v-row class="mt-5" v-if="loading && items.length === 0">
        <v-spacer />
        <v-progress-circular indeterminate color="primary" />
        <v-spacer />
      </v-row>
      <p v-else-if="!loading && items.length === 0 && noDataText" class="text-center mt-8">
        {{ noDataText }}
      </p>
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

    return { selectedItems, onUpdateSelection };
  },
};
</script>
