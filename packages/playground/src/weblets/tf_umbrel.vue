<template>
  <weblet-layout ref="layout">
    <template #title>Deploy an Umbrel Instance </template>
    <template #subtitle>
      Umbrel is an OS for running a personal server in your home. Self-host open source apps like
      Nextcloud, Bitcoin node, and more.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_umbrel.html" class="app-link">
        Quick start documentation
      </a>
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
        :value="username"
        :rules="[
          validators.required('Username is required.'),
          validators.minLength('Username minLength is 2 chars.', 2),
          validators.maxLength('Username maxLength is 15 chars.', 15),
        ]"
        #="{ props }"
      >
        <v-text-field label="Username" v-model="username" v-bind="props" />
      </input-validator>

      <password-input-wrapper #="{ props }">
        <input-validator
          :value="password"
          :rules="[
            validators.required('Password is required.'),
            validators.minLength('Password minLength is 6 chars.', 6),
            validators.maxLength('Password maxLength is 15 chars.', 15),
          ]"
          #="{ props: validatorProps }"
        >
          <v-text-field
            label="Password"
            v-model="password"
            v-bind="{ ...props, ...validatorProps }"
          />
        </input-validator>
      </password-input-wrapper>

      <v-switch color="primary" inset label="Public IPv4" v-model="ipv4" />

      <SelectSolutionFlavor v-model="solution" />
      <SelectFarm
        :filters="{
          cpu: solution?.cpu,
          memory: solution?.memory,
          ssd: (solution?.disk ?? 0) + 10 + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0),
          publicIp: ipv4,
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
import type { Farm, solutionFlavor as SolutionFlavor } from '../types'
import { ProjectName } from '../types'
import { deployVM } from '../utils/deploy_vm'
import { getGrid } from '../utils/grid'
import { normalizeError } from '../utils/helpers'
import rootFs from '../utils/root_fs'

const layout = useLayout()
const valid = ref(false)
const profileManager = useProfileManager()

const name = ref('UM' + generateString(9))
const username = ref('admin')
const password = ref(generateString(12))
const ipv4 = ref(false)
const solution = ref() as Ref<SolutionFlavor>
const farm = ref() as Ref<Farm>

async function deploy() {
  layout.value.setStatus('deploy')

  const projectName = ProjectName.Umbrel.toLowerCase()

  try {
    const grid = await getGrid(profileManager.profile!, projectName)

    await layout.value.validateBalance(grid!)

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          disks: [
            {
              size: 10,
              mountPoint: '/var/lib/docker',
            },
            {
              size: solution.value.disk,
              mountPoint: '/umbrelDisk',
            },
          ],
          flist: 'https://hub.grid.tf/tf-official-apps/umbrel-latest.flist',
          entryPoint: '/sbin/zinit init',
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          planetary: true,
          publicIpv4: ipv4.value,
          envs: [
            { key: 'SSH_KEY', value: profileManager.profile!.ssh },
            { key: 'USERNAME', value: username.value },
            { key: 'PASSWORD', value: password.value },
            { key: 'UMBREL_DISK', value: '/umbrelDisk' },
          ],
          rootFilesystemSize: rootFs(solution.value.cpu, solution.value.memory),
        },
      ],
    })

    layout.value.reloadDeploymentsList()
    layout.value.setStatus('success', 'Successfully deployed an Umbrel instance.')
    layout.value.openDialog(vm, {
      SSH_KEY: 'Public SSH Key',
      USERNAME: 'Username',
      PASSWORD: 'Password',
      UMBREL_DISK: 'Umbrel Disk',
    })
  } catch (e) {
    layout.value.setStatus('failed', normalizeError(e, 'Failed to deploy an Umbrel instance.'))
  }
}
</script>

<script lang="ts">
import SelectFarm from '../components/select_farm.vue'
import SelectSolutionFlavor from '../components/select_solution_flavor.vue'

export default {
  name: 'TfUmbrel',
  components: {
    SelectSolutionFlavor,
    SelectFarm,
  },
}
</script>
