<template>
  <div :style="{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }">
    <v-expansion-panels :model-value="[0]" class="mx-3" :style="{ width: '1050px' }">
      <v-expansion-panel eager>
        <template #title>
          <span class="text-subtitle-1">Logs {{ logs.length }}</span>
        </template>

        <v-expansion-panel-text eager :style="{ maxHeight: '500px', overflowY: 'scroll' }">
          <v-container style="max-width: 100%">
            <v-data-table class="elevation-1">
              <template #body>
                <tr
                  style="max-width: 40px"
                  v-for="(item, index) in logs"
                  :key="index"
                  :class="{ 'text-primary': item.type === 'log' }"
                >
                  <td style="white-space: nowrap">[{{ item.type.toUpperCase() }}] {{ item.timestamp }}</td>
                  <td>{{ item.messages.join() }}</td>
                </tr>
              </template>
              <template #bottom></template>
            </v-data-table>
          </v-container>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { type LoggerInstance as LI, LoggerInterceptor } from "logger-interceptor";
import { ref } from "vue";

const VERSION = 1;
const KEY = "TF_LOGGER_V." + VERSION;

type LoggerInstance = Omit<LI, "logger" | "date">;

export default {
  name: "TfLogger",
  setup() {
    const logs = ref<LoggerInstance[]>(JSON.parse(atob(localStorage.getItem(KEY) ?? "") || "[]"));
    const interceptor = new LoggerInterceptor(console);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interceptor.on(({ logger: _, date: __, ...log }) => {
      _.log(log.messages.join());
      if (import.meta.env.DEV) {
        if (log.messages.join().includes("vite")) {
          return;
        }
      }

      logs.value.push(log);
      localStorage.setItem(KEY, btoa(JSON.stringify(logs.value)));
    });

    return {
      logs,
    };
  },
};
</script>
