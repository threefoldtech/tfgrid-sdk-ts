<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import { provide } from 'vue'

const deploymentList: { [key: number]: Fn } = {}

provide('deployment:list:manager', {
  register(key: number, fn: Fn) {
    deploymentList[key] = fn
  },
  unregister(key: number) {
    delete deploymentList[key]
  },
  load() {
    Object.values(deploymentList).forEach((fn) => {
      const x = fn()
      if (x) x()
    })
  },
})
</script>

<script lang="ts">
import { inject } from 'vue'
type Fn = () => void | (() => void)

export interface DeploymentListManager {
  register(key: number, fn: Fn): void
  unregister(key: number): void
  load(): void
}

export function useDeploymentListManager(): DeploymentListManager | null {
  return inject('deployment:list:manager', null)
}

export default {
  name: 'DeploymentListManager',
}
</script>
