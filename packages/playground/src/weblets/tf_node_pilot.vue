<template>
  <weblet-layout ref="layout">
    <template #title>Deploy a Node Pilot</template>
    <template #subtitle>
      Deploy a new Node Pilot on the Threefold Grid
      <a
        class="app-link"
        href="https://manual.grid.tf/weblets/weblets_nodepilot.html"
        target="_blank"
      >
        Quick start documentation
      </a>
      .
    </template>

    <form-validator v-model="valid">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
          validators.minLength('Name minLength is 2 chars.', 2),
          validators.maxLength('Name maxLength is 15 chars.', 15),
        ]"
        #="{ props }"
      >
        <v-text-field label="Name" v-model="name" v-bind="props" />
      </input-validator>

      <input-validator
        :value="cpu"
        :rules="[
          validators.required('CPU is required.'),
          validators.isInt('CPU must be a valid integer.'),
          validators.min('CPU min is 2 cores.', 2),
          validators.max('CPU max is 32 cores.', 32),
        ]"
        #="{ props }"
      >
        <v-text-field label="CPU (vCores)" type="number" v-model.number="cpu" v-bind="props" />
      </input-validator>

      <input-validator
        :value="memory"
        :rules="[
          validators.required('Memory is required.'),
          validators.isInt('Memory must be a valid integer.'),
          validators.min('Minimum allowed memory is 256 MB.', 256),
          validators.max('Maximum allowed memory is 256 GB.', 256 * 1024),
        ]"
        #="{ props }"
      >
        <v-text-field label="Memory (MB)" type="number" v-model.number="memory" v-bind="props" />
      </input-validator>

      <SelectFarmId
        :filters="{
          cpu,
          memory,
          ssd: 32,
          publicIp: true,
        }"
        v-model="farm"
      />
    </form-validator>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString } from '@threefold/grid_client'
import { type Ref, ref } from 'vue'

import { useLayout } from '../components/weblet_layout.vue'
import { useProfileManager } from '../stores'
import { type Farm, ProjectName } from '../types'
import { deployVM } from '../utils/deploy_vm'
import { getGrid } from '../utils/grid'

const layout = useLayout()
const valid = ref(false)
const profileManager = useProfileManager()

const name = ref('NP' + generateString(8))
const cpu = ref(8)
const memory = ref(8192)
const farm = ref() as Ref<Farm>

async function deploy() {
  layout.value.setStatus('deploy')

  const projectName = ProjectName.NodePilot.toLowerCase()

  try {
    const grid = await getGrid(profileManager.profile!, projectName)

    await layout.value.validateBalance(grid!)

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: cpu.value,
          memory: memory.value,
          flist: 'https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist',
          entryPoint: '/',
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          publicIpv4: true,
          publicIpv6: true,
          planetary: false,
          envs: [{ key: 'SSH_KEY', value: profileManager.profile!.ssh }],
          rootFilesystemSize: 2,
          disks: [
            {
              size: 15,
              mountPoint: '/mnt/' + generateString(10),
            },
            {
              size: 15,
              mountPoint: '/mnt/' + generateString(10),
            },
          ],
        },
      ],
    })

    layout.value.reloadDeploymentsList()
    layout.value.setStatus('success', 'Successfully deployed a node pilot instance.')
    layout.value.openDialog(vm, { SSH_KEY: 'Public SSH Key' })
  } catch (e) {
    layout.value.setStatus('failed', normalizeError(e, 'Failed to deploy a Node Pilot instance.'))
  }
}
</script>

<script lang="ts">
import SelectFarmId from '../components/select_farm.vue'
import { normalizeError } from '../utils/helpers'

export default {
  name: 'NodePilot',
  components: {
    SelectFarmId,
  },
}
</script>
