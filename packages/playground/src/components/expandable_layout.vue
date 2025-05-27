<template>
  <section>
    <div class="d-flex my-6">
      <v-card-subtitle v-if="title" class="text-subtitle-1 mt-3">
        {{ title }}
      </v-card-subtitle>
      <v-spacer />
      <v-tooltip text="Add">
        <template #activator="{ props: addBtnProps }">
          <v-btn icon="mdi-plus" color="secondary" v-bind="addBtnProps" :disabled="disabled" @click="$emit('add')" />
        </template>
      </v-tooltip>
    </div>
    <v-divider class="my-2" />
    <div v-for="(item, index) in modelValue" :key="item">
      <div class="d-flex">
        <div class="flex-grow-1 mr-4">
          <slot :item="item" :index="index" :is-required="required.includes(index)" />
        </div>
        <div class="d-flex">
          <v-spacer />
          <v-tooltip text="Remove">
            <template #activator="{ props: removeBtnProps }">
              <v-btn
                v-if="!required.includes(index)"
                color="error"
                icon="mdi-delete-outline"
                v-bind="removeBtnProps"
                @click="remove(index)"
              />
            </template>
          </v-tooltip>
        </div>
      </div>
      <v-divider v-if="index + 1 < modelValue.length" class="mb-4" />
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
