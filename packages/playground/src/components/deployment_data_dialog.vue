<template>
  <v-row justify="center">
    <v-dialog model-value @update:model-value="$emit('close')" scrollable width="70%">
      <v-card>
        <v-card-title class="d-flex flex-column" v-if="!onlyJson">
          <div class="d-flex justify-center">
            <v-btn-toggle divided v-model="showType" mandatory>
              <v-btn variant="outlined"> details </v-btn>
              <v-btn variant="outlined"> json </v-btn>
            </v-btn-toggle>
          </div>

          <v-tabs v-model="activeTab" align-tabs="center" class="my-4" v-if="showType === 0">
            <v-tab v-for="item in contracts" :key="item.contractId" variant="tonal" color="primary">
              {{ item.name }}
            </v-tab>
          </v-tabs>
        </v-card-title>
        <v-card-text>
          <template v-if="showType === 0">
            <v-form readonly v-if="contract">
              <CopyReadonlyInput label="Name" :data="contract.name" />
              <CopyReadonlyInput label="Contract ID" :data="contract.contractId" />

              <v-switch inset label="Public IP" v-if="!contract.publicIP" />
              <template v-else>
                <CopyReadonlyInput
                  label="Public IPv4"
                  :data="contract.publicIP.ip"
                  v-if="contract.publicIP.ip"
                />
                <CopyReadonlyInput
                  label="Public IPv6"
                  :data="contract.publicIP.ip6"
                  v-if="contract.publicIP.ip6"
                />
              </template>

              <CopyReadonlyInput
                label="Planetary Network IP"
                :data="contract.planetary"
                v-if="contract.planetary"
              />
              <v-switch inset label="Planetary Network IP" v-else />

              <CopyReadonlyInput label="Network Name" :data="contract.interfaces[0].network" />
              <CopyReadonlyInput label="CPU (vCores)" :data="contract.capacity.cpu" />
              <CopyReadonlyInput label="Memory (MB)" :data="contract.capacity.memory" />
              <CopyReadonlyInput
                v-for="disk of contract.mounts"
                :key="disk.name"
                :label="'Disk( ' + disk.mountPoint + ' ) GB'"
                :data="Math.ceil(disk.size / (1024 * 1024 * 1024))"
              />
              <CopyReadonlyInput label="WireGuard IP" :data="contract.interfaces[0].ip" />
              <CopyReadonlyInput
                label="WireGuard Config"
                :data="contract.wireguard"
                v-if="contract.wireguard"
              />
              <CopyReadonlyInput label="Flist" :data="contract.flist" v-if="contract.flist" />
              <template v-if="environments !== false">
                <template v-for="key of Object.keys(contract.env)" :key="key">
                  <template v-if="environments[key] || !(key in environments)">
                    <CopyReadonlyInput
                      v-if="contract.env[key] !== 'true' && contract.env[key] !== 'false'"
                      textarea
                      :label="getLabel(key)"
                      :data="contract.env[key]"
                    />
                    <v-switch
                      v-else
                      inset
                      color="primary"
                      :model-value="Boolean(contract.env[key])"
                      :label="getLabel(key)"
                    />
                  </template>
                </template>
              </template>
            </v-form>
          </template>
          <template v-else>
            <HighlightDark v-if="$vuetify.theme.name === 'dark'" />
            <HighlightLight v-else />
            <pre>
            <code class="hljs json dark-bg" v-html="html"></code>
          </pre>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="tonal" @click="copy">Copy</v-btn>
          <v-btn color="error" variant="tonal" @click="$emit('close')">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts" setup>
import hljs from 'highlight.js'
import { computed, type PropType, ref } from 'vue'

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    required: true,
  },
  environments: {
    type: Object as PropType<{ [key: string]: string | boolean } | false>,
    required: false,
    default: () => ({}),
  },
  onlyJson: {
    type: Boolean,
    required: false,
    default: () => false,
  },
})
defineEmits<{ (event: 'close'): void }>()

const showType = ref(props.onlyJson ? 1 : 0)
const activeTab = ref(0)
const contracts = computed(() => {
  if (!props.data) return []
  if ('masters' in props.data) return [...props.data.masters, ...props.data.workers]
  return Array.isArray(props.data) ? props.data : [props.data]
})
const contract = computed(() => contracts.value?.[activeTab.value] ?? {})
const code = computed(() => JSON.stringify(props.data || {}, undefined, 2))
const html = computed(() => hljs.highlight(code.value, { language: 'json' }).value)

function copy() {
  navigator.clipboard.writeText(code.value)
}

function getLabel(key: string): string {
  if (props.environments !== false && typeof props.environments[key] === 'string') {
    return props.environments[key] as string
  }
  return key
}
</script>

<script lang="ts">
import CopyReadonlyInput from './copy_readonly_input.vue'
import { HighlightDark, HighlightLight } from './highlight_themes'

export default {
  name: 'DeploymentDataDialog',
  components: {
    CopyReadonlyInput,
    HighlightDark,
    HighlightLight,
  },
}
</script>
