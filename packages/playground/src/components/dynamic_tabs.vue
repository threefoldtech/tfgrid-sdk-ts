<template>
  <v-tabs v-show="!hideTabs" v-model="activeTab" align-tabs="center" color="primary" class="mb-6">
    <v-tab v-for="tab in tabs" :key="tab.value" :disabled="disabled">
      <v-icon :icon="tab.icon" class="mr-2" v-if="tab.icon" />
      <img
        :src="baseUrl + tab.imgPath"
        height="20"
        class="mr-2"
        :alt="tab.title"
        v-else-if="tab.imgPath"
      />
      {{ tab.title }}
      <v-chip color="error" v-if="forms[tabs.indexOf(tab)]?.invalid" class="ml-1">invalid</v-chip>
    </v-tab>
  </v-tabs>

  <v-tab-item v-for="(tab, index) in tabs" :key="tab.value" v-show="index === activeTab">
    <template v-if="destroy ? index === activeTab : true">
      <form-validator ref="forms">
        <slot
          :name="tab.value"
          :index="index"
          :tab="tab"
          :activeTab="activeTab"
          :tabs="tabs"
          v-if="$slots[tab.value]"
        ></slot>
        <slot
          :index="index"
          :tab="tab"
          :activeTab="activeTab"
          :tabs="tabs"
          v-else-if="$slots.default"
        ></slot>
        <template v-else> Please add content for this tab! </template>
      </form-validator>
    </template>
  </v-tab-item>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

export interface Tab {
  title: string
  value: string
  icon?: string
  imgPath?: string
}

const props = defineProps<{
  modelValue?: number
  tabs: Tab[]
  disabled?: boolean
  destroy?: boolean
  hideTabs?: boolean
}>()
const emits = defineEmits<{ (event: 'update:modelValue', value: number): void }>()

const forms = ref<any[]>([])

const activeTab = ref<number>(props.modelValue ?? 0)
watch(activeTab, (t) => emits('update:modelValue', t))

const valid = computed(() => forms.value.reduce((r, f) => r && f.valid, true))
const invalid = computed(() => !valid.value)

defineExpose({
  valid,
  invalid,
})

const baseUrl = import.meta.env.BASE_URL
</script>

<script lang="ts">
export default {
  name: 'DTabs',
}
</script>
