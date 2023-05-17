<template>
  <section>
    <div class="d-flex mb-6">
      <v-spacer />
      <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('add')"> add </v-btn>
    </div>
    <div v-for="(item, index) in modelValue" :key="item">
      <div class="d-flex">
        <div class="flex-grow-1 mr-4">
          <slot :item="item" :index="index" />
        </div>
        <div class="d-flex">
          <v-spacer />
          <v-btn color="error" icon="mdi-delete-outline" @click="remove(index)" />
        </div>
      </div>
      <v-divider class="mb-4" v-if="index + 1 < modelValue.length" />
    </div>
  </section>
</template>

<script lang="ts" setup>
const props = defineProps<{ modelValue: any[] }>();
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
