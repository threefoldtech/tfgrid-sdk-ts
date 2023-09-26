<template>
  <v-card class="pa-4 my-4 white--text">
    <v-row class="pa-5 text-center">
      <button @click="toggleList">
        <div>
          <span>Filters</span>
          <span :class="{ 'rotate-arrow': isExpanded }">&#9660;</span>
        </div>
      </button>
    </v-row>
  </v-card>

  <v-card class="pa-4 my-4 white--text" v-if="isExpanded">
    <v-row class="pa-5 text-center" justify="end">
      <v-column v-for="(filter, index) in props.filters" :key="index" class="pr-8">
        <v-list-subheader>{{ filter.label }}</v-list-subheader>
        <input-validator
          :value="filterValues[filter.key].value"
          :rules="validated(filter.key, validators)"
          #="{ props }"
        >
          <v-text-field type="text" v-model="filterValues[filter.key].value" v-bind="props" />
        </input-validator>
      </v-column>
      <v-column class="pr-7 pt-12">
        <v-btn color="blue" class="ml-auto bold-text" @click="resetFilters">Reset Filters</v-btn>
      </v-column>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { Validators } from "../types";

// TODO: placeholder

interface Filter {
  label: string;
  key: string;
  placeholder: string;
}

const isExpanded = ref(false);
const props = defineProps({
  filters: {
    type: Array as () => Filter[],
    default: () => [],
    required: true,
  },
});

const filterValues = Object.fromEntries(props.filters.map(filter => [filter.key, ref("")]));

function toggleList() {
  isExpanded.value = !isExpanded.value;
}

function validated(key: string, validators: Validators) {
  const rules = [];
  if (key === "total_sru" || key === "total_hru" || key === "total_mru" || key == "total_cru") {
    rules.push(validators.isDecimal("This Field accepts only a valid number."));
    rules.push(validators.min("This Field must be a number larger than 0.", 1));
  }

  if (key === "gpu_vendor_name" || key === "gpu_device_name") {
    const allowedPattern = /^[A-Za-z0-9[\]/,.]+$/; // Remove the unnecessary escape for the dot
    if (!allowedPattern.test(filterValues[key].value)) {
      rules.push(validators.isAlphanumeric("This Field accepts only letters and numbers."));
    }
  }

  return rules;
}

function resetFilters() {
  for (const key in filterValues) {
    if (key in filterValues) {
      filterValues[key].value = "";
    }
  }
}
</script>

<style>
/* TODO: Not rotating */
.rotate-arrow {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
</style>
