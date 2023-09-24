<template>
  <section>
    <div class="d-flex my-6">
      <v-card-subtitle class="text-subtitle-1 mt-3" v-if="title">{{ title }}</v-card-subtitle>
      <v-spacer />
      <v-tooltip text="Add">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-plus"
            variant="tonal"
            color="primary"
            @click="$emit('add')"
            v-bind="props"
            :disabled="disabled"
          />
        </template>
      </v-tooltip>
    </div>
    <v-divider class="my-2" />
    <div v-for="(item, index) in modelValue" :key="item">
      <div class="d-flex">
        <div class="flex-grow-1 mr-4">
          <slot :item="item" :index="index" :isRequired="required.includes(index)" />
        </div>
        <div class="d-flex">
          <v-spacer />
          <v-tooltip text="Remove">
            <template #activator="{ props }">
              <v-btn
                color="error"
                icon="mdi-delete-outline"
                @click="remove(index)"
                v-if="!required.includes(index)"
                v-bind="props"
              />
            </template>
          </v-tooltip>
        </div>
      </div>
      <v-divider class="mb-4" v-if="index + 1 < modelValue.length" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: Array as PropType<any[]>,
    required: true,
  },
  required: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
  disabled: Boolean,
  title: String,
});
const emits = defineEmits<{
  (event: "update:modelValue", value: any[]): void;
  (event: "add"): void;
}>();

function remove(i: number) {
  const items = [...props.modelValue];
  items.splice(i, 1);
  emits("update:modelValue", items);
}
</script>

<script lang="ts">
export default {
  name: "ExpandableLayout",
};
</script>
