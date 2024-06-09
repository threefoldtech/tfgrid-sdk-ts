<template>
  <div class="mb-4">
    <label class="v-label" v-if="label">{{ label }}</label>

    <v-range-slider :min="min" :max="max" :step="step" hide-details v-bind="$attrs" v-model="value">
      <template #prepend>
        <v-text-field
          v-bind="baseRangeSliderProps"
          :min="min"
          :max="max"
          :model-value="value?.[0]"
          @update:model-value="
            if (value) {
              value[0] = normalizeValue($event);
            }
          "
        />
      </template>
      <template #append>
        <v-text-field
          v-bind="baseRangeSliderProps"
          :model-value="value?.[1]"
          @update:model-value="
            if (value) {
              value[1] = normalizeValue($event);
            }
          "
        />
      </template>
    </v-range-slider>
  </div>
</template>

<script lang="ts">
import { ref, toRef } from "vue";

import { useWatchDeep } from "@/hooks";

const baseRangeSliderProps = {
  class: "tf-slider-input",
  type: "number",
  compact: "density",
  "hide-details": true,
  "single-line": true,
  variant: "underlined",
} as const;

export default {
  name: "TfRangeSlider",
  props: {
    label: String,
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, default: () => 1 },
    modelValue: String,
    int: { type: Boolean, default: () => false },
  },
  emits: {
    "update:model-value": (value: string) => true || value,
  },
  setup(_props, ctx) {
    const props = toRef(_props);

    useWatchDeep(
      () => props.value.modelValue,
      () => {
        value.value = _getCurrentValue();
      },
      { deep: true },
    );

    const value = ref<[number, number]>();
    value.value = _getCurrentValue();

    useWatchDeep(value, val => val && bindValue(val.join(",")), { debounce: 100 });

    function bindValue(value: string) {
      if (value !== props.value.modelValue) {
        ctx.emit("update:model-value", value);
      }
    }

    function _getCurrentValue(): [number, number] {
      const { modelValue, min, max } = props.value;

      if (typeof modelValue === "string") {
        const range = modelValue.split(",");
        if (range.length === 2) {
          const [x, y] = range;
          const a = Number(x);
          const b = Number(y);

          if (!isNaN(a) && !isNaN(b)) {
            return [a, b];
          }
        }
      }

      if (value.value) {
        return value.value;
      }

      const _value: [number, number] = [min, max];
      bindValue(_value.join(","));
      return _value;
    }

    function normalizeValue(v: string): number {
      v = v.toString();

      const { min, max, int } = props.value;
      const val = int ? parseInt(v) : Number(v);
      return Math.min(Math.max(min, val), max);
    }

    return { baseRangeSliderProps, value, normalizeValue };
  },
};
</script>

<style lang="scss">
.tf-slider-input {
  width: 50px;

  input {
    text-align: center;
    padding-top: 10px;
  }
}
</style>
