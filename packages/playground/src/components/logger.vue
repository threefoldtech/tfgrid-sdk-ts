<template>
  <v-expansion-panels v-model="panel" class="mx-3" style="max-width: 80%">
    <v-expansion-panel>
      <template #title>
        <span class="text-subtitle-1" v-text="'logs'" />
      </template>

      <v-expansion-panel-text>
        <v-container style="max-width: 100%">
          <v-data-table class="elevation-1">
            <template #body>
              <tr style="max-width: 40px" v-for="(item, index) in logs" :key="index">
                <td style="white-space: nowrap">{{ item.timestamp }}</td>
                <td>{{ item.messages.join() }}</td>
              </tr>
            </template>
            <template #bottom></template>
          </v-data-table>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script lang="ts">
import { LoggerInterceptor } from "logger-interceptor";
import { ref } from "vue";
const KEY = "TF-Logger-v1";
export default {
  name: "TfLogger",
  setup() {
    const panel = ref();
    const interceptor = new LoggerInterceptor(console);
    const logs = ref<any[]>(JSON.parse(atob(localStorage.getItem(KEY) ?? "") ?? "[]"));
    interceptor.on(({ logger: _, date: __, ...log }) => {
      logs.value.push(log);
      localStorage.setItem(KEY, btoa(JSON.stringify(logs.value)));
    });

    function scrollToLogs() {
      panel.value = 0;
    }
    return {
      logs,
      panel,
      scrollToLogs,
    };
  },
};
</script>
