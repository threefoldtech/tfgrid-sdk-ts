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
      <v-checkbox-btn
        :model-value="selectedItems.length > 0 && selectedItems.length === items.length"
        :indeterminate="selectedItems.length > 0 && items.length !== selectedItems.length"
        :disabled="deleting || loading"
        @change="onUpdateSelection"
      />
    </template>

    <template #[`item.data-table-select`]="{ item, toggleSelect }">
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

<script lang="ts" setup>
import { ref, watch } from "vue";

import type { VDataTableHeader } from "../types";

const props = defineProps<{
  headers: VDataTableHeader;
  items: any[];
  loading: boolean;
  deleting: boolean;
  modelValue: any[];
  noDataText?: string;
}>();
const emits = defineEmits<{ (event: "update:model-value", value: any[]): void }>();

const selectedItems = ref<any[]>([]);
watch(selectedItems, is => emits("update:model-value", is));

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
</script>

<script lang="ts">
export default {
  name: "ListTable",
};
</script>
