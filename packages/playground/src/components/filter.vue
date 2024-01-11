<template>
  <v-expansion-panels v-model="panel" class="mb-3">
    <v-expansion-panel>
      <template #title>
        <span class="text-subtitle-1" v-text="'Filters'" />
      </template>

      <v-expansion-panel-text>
        <form-validator
          v-model="isValidForm"
          valid-on-init
          ref="formRef"
          @update:model-value="$emit('update:valid', $event)"
        >
          <v-container fluid>
            <v-row no-gutters>
              <v-col v-for="key in Object.keys($props.modelValue)" :key="key" v-bind="fitlerColProps">
                <input-validator
                  v-if="$props.modelValue[key].label"
                  :rules="$props.modelValue[key].value ? $props.modelValue[key].rules?.[0] ?? [] : []"
                  :async-rules="$props.modelValue[key].rules?.[1] ?? []"
                  :value="$props.modelValue[key].value"
                  #="{ props }"
                  ref="inputRef"
                >
                  <v-text-field
                    v-bind="props"
                    variant="outlined"
                    v-model="$props.modelValue[key].value"
                    :label="$props.modelValue[key].label"
                    :type="$props.modelValue[key].type"
                    :disabled="loading"
                  >
                    <template #append-inner>
                      <v-tooltip :text="$props.modelValue[key].tooltip">
                        <template #activator="{ props }">
                          <VIcon icon="mdi-information-outline" v-bind="props" />
                        </template>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </input-validator>
              </v-col>
              <slot name="options" :props="fitlerColProps"> </slot>
            </v-row>
          </v-container>
        </form-validator>

        <v-divider class="mb-4 mx-8" />
        <v-container fluid>
          <v-row justify="end">
            <v-btn
              :disabled="!isValidForm || !(formHasValues || Object.keys(route.query).length > 0)"
              @click="resetFilters"
              variant="outlined"
              color="anchor"
              text="Clear"
            />
            sameState = {{ sameState }}
            <v-btn
              :disabled="!isValidForm || !formHasValues || sameState"
              class="ml-4 mr-7"
              :loading="loading"
              @click="applyFilters"
              variant="outlined"
              color="secondary"
              text="Apply"
            />
          </v-row>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import type { NodeStatus } from "@threefold/gridproxy_client";
import { isEmpty, isEqual } from "lodash";
import { nextTick } from "process";
import { computed, defineComponent, onMounted, type PropType, ref, watch } from "vue";
import { type LocationQueryRaw, useRoute } from "vue-router";

import { useFormRef } from "@/hooks/form_validator";
import { useInputRef } from "@/hooks/input_validator";
import router from "@/router";
import type { FilterOptions, InputFilterType } from "@/types";

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ [key: string]: InputFilterType }>,
    required: true,
  },
  options: {
    type: Object as PropType<FilterOptions>,
    required: true,
  },
  loading: Boolean,
  valid: Boolean,
});

const emit = defineEmits(["apply", "update:valid", "reset", "update:values"]);
const isValidForm = ref(false);
const inputRef = useInputRef(true);
const panel = ref([0]);
const formRef = useFormRef();
const route = useRoute();
const isClearButtonEnabled = ref();

const sameState = ref(false);
const defaultStateInputs = { ...props.modelValue };
const defaultStateOptions = { ...props.options };

const formHasValues = computed(
  () =>
    Object.values(props.modelValue).some(obj => obj.value && obj.value.length >= 1) ||
    props.options.status?.length ||
    props.options.gpu ||
    props.options.gateway,
);

const parseQueries = () => {
  const queries = route.query;

  for (const query of Object.keys(queries)) {
    const currentStateValue =
      Reflect.get(queries, query) === "false"
        ? false
        : Reflect.get(queries, query) === "true"
        ? true
        : Reflect.get(queries, query);

    if (Reflect.get(props.options, query) && Reflect.get(props.options, query) === currentStateValue) {
      Reflect.set(defaultStateOptions, query, currentStateValue);
    }

    if (props.modelValue[query] && props.modelValue[query].value === currentStateValue) {
      defaultStateInputs[query].value = queries[query] as string;
    }
  }

  console.log("defaultStateInputs", defaultStateInputs);
  console.log("props.modelValue", props.modelValue);
  const sameInputs = !!Object.keys(queries).length && isEqual(defaultStateInputs, props.modelValue);

  console.log("defaultStateOptions", defaultStateOptions);
  console.log("props.options", props.options);
  const sameOptions = !!Object.keys(queries).length && isEqual(defaultStateOptions, props.options);

  console.log("Same inputs: ", sameInputs);
  console.log("Same options: ", sameOptions);

  sameState.value = sameInputs && sameOptions;
};

watch(
  [() => props.modelValue, () => props.options],
  ([inputs, options]) => {
    isClearButtonEnabled.value = Object.values(inputs).some(
      obj => (obj.value?.length && options.gpu) || options.gateway || options.status?.length,
    );
    parseQueries();
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  for (const obj of Object.keys({ ...props.modelValue, ...props.options })) {
    const key = obj;
    if (Object.prototype.hasOwnProperty.call(route.query, key)) {
      emit("update:values", obj, Reflect.get(route.query, key));
    }
  }
});

const setFilterQueries = () => {
  const existingQuery: Record<string, string | (true | undefined) | NodeStatus | undefined> = {
    ...route.query,
    gpu: props.options.gpu || undefined,
    gateway: props.options.gateway || undefined,
    status: props.options.status || undefined,
  };

  for (const [key, { value }] of Object.entries(props.modelValue)) {
    if (value) {
      existingQuery[key] = value;
    } else {
      delete existingQuery[key];
    }
  }

  router.push({ path: route.path, query: existingQuery as LocationQueryRaw });
};

const resetFilterQueries = () => router.push({ path: route.path, query: {} });

const applyFilters = () => {
  emit(
    "apply",
    Object.keys(props.modelValue).reduce((res, key) => {
      res[key] = { ...props.modelValue[key] };
      return res;
    }, {} as any),
  );
  setFilterQueries();
};

const resetFilters = () => {
  if (!isEmpty(route.query)) {
    emit(
      "reset",
      Object.keys(props.modelValue).reduce((res, key) => {
        res[key] = { ...props.modelValue[key], value: undefined };
        return res;
      }, {} as any),
      true,
    );
  } else {
    emit(
      "reset",
      Object.keys(props.modelValue).reduce((res, key) => {
        res[key] = { ...props.modelValue[key], value: undefined };
        return res;
      }, {} as any),
      false,
    );
  }

  nextTick(() => resetFilterQueries());
};

const fitlerColProps = { class: "py-2 px-4", cols: 12, md: 6, lg: 3 };
</script>

<script lang="ts">
export default defineComponent({
  name: "Filters",
});
</script>
<style scoped>
.v-expansion-panel-title {
  padding: 6px 24px;
}
</style>
