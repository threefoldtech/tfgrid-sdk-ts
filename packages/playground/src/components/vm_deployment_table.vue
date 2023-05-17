<template>
  <v-alert v-if="!loading && count && items.length < count" type="warning" variant="tonal">
    Failed to load <strong>{{ count - items.length }}</strong> deployment{{
      count - items.length > 1 ? 's' : ''
    }}.
  </v-alert>

  <ListTable
    :headers="[
      { title: '#', key: 'index' },
      { title: 'PLACEHOLDER', key: 'data-table-select' },
      { title: 'Name', key: 'name' },
      { title: 'Public IPv4', key: 'ipv4' },
      { title: 'Public IPv6', key: 'ipv6' },
      { title: 'Planetary Network IP', key: 'planetary' },
      { title: 'Flist', key: 'flist' },
      { title: 'Billing Rate', key: 'billing' },
      { title: 'Actions', key: 'actions' },
    ]"
    :items="items"
    :loading="loading"
    :deleting="deleting"
    :model-value="$props.modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :no-data-text="`No ${projectName} deployments found on this account.`"
  >
    <template #[`item.index`]="{ item }">
      {{ items.indexOf(item?.value) + 1 }}
    </template>

    <template #[`item.name`]="{ item }">
      {{ item.value[0].name }}
    </template>

    <template #[`item.ipv4`]="{ item }">
      {{ item.value[0].publicIP?.ip || 'None' }}
    </template>

    <template #[`item.ipv6`]="{ item }">
      {{ item.value[0].publicIP?.ip6 || 'None' }}
    </template>

    <template #[`item.planetary`]="{ item }">
      {{ item.value[0].planetary || 'None' }}
    </template>

    <template #[`item.flist`]="{ item }">
      <v-tooltip :text="item.value[0].flist" location="bottom right">
        <template #activator="{ props }">
          <p v-bind="props">
            {{ item.value[0].flist.replace('https://hub.grid.tf/', '').replace('.flist', '') }}
          </p>
        </template>
      </v-tooltip>
    </template>

    <template #[`item.billing`]="{ item }">
      {{ item.value[0].billing }}
    </template>
    <template #[`item.actions`]="{ item }">
      <v-chip
        color="error"
        variant="tonal"
        v-if="deleting && ($props.modelValue || []).includes(item.value)"
      >
        Deleting...
      </v-chip>
      <v-btn-group variant="tonal" v-else>
        <slot :name="projectName + '-actions'" :item="item"></slot>
      </v-btn-group>
    </template>
  </ListTable>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { useProfileManager } from '../stores'
import { getGrid, updateGrid } from '../utils/grid'
import { loadVms, mergeLoadedDeployments } from '../utils/load_deployment'

const profileManager = useProfileManager()

const props = defineProps<{
  projectName: string
  modelValue: any[]
  deleting: boolean
}>()
defineEmits<{ (event: 'update:model-value', value: any[]): void }>()

const loading = ref(false)
const count = ref<number>()
const items = ref<any[]>([])

onMounted(loadDeployments)
async function loadDeployments() {
  items.value = []
  loading.value = true
  const grid = await getGrid(profileManager.profile!, props.projectName)
  const chunk1 = await loadVms(grid!)
  const chunk2 = await loadVms(updateGrid(grid!, { projectName: props.projectName.toLowerCase() }))
  const filter =
    props.projectName === ProjectName.VM
      ? undefined
      : ([vm]: [{ flist: string }]) =>
          vm.flist.replace(/-/g, '').includes(props.projectName.toLowerCase())

  const chunk3 =
    props.projectName === ProjectName.Fullvm
      ? { count: 0, items: [] }
      : await loadVms(updateGrid(grid!, { projectName: '' }), { filter })
  const vms = mergeLoadedDeployments(chunk1, chunk2, chunk3 as any)

  count.value = vms.count
  items.value = vms.items

  loading.value = false
}

defineExpose({ loadDeployments })
</script>

<script lang="ts">
import { ProjectName } from '../types'
import ListTable from './list_table.vue'

export default {
  name: 'VmDeploymentTable',
  components: {
    ListTable,
  },
}
</script>
