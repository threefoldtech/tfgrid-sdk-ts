<template>
  <v-switch v-model="light" inset color="primary" prepend-icon="mdi-moon-waning-crescent">
    <template #label>
      <v-badge color="red-accent-4" inline content="Experimental">
        <v-icon icon="mdi-brightness-4" />
      </v-badge>
    </template>
  </v-switch>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const light = ref(false)

const KEY = 'APP_CURRENT_THEME'

watch(light, (light) => (theme.global.name.value = light ? 'light' : 'dark'))
watch(theme.global.name, (theme) => localStorage.setItem(KEY, theme))
onMounted(() => {
  const theme = localStorage.getItem('APP_CURRENT_THEME')
  light.value = theme === 'light'
})
</script>

<script lang="ts">
export default {
  name: 'AppTheme',
}
</script>
