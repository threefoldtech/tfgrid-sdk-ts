<template>
  <div :style="{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }">
    <v-expansion-panels :model-value="[0]" class="mx-3" :style="{ width: '1050px' }">
      <v-expansion-panel eager>
        <template #title>
          <span class="text-subtitle-1">Console Logs ({{ logs.length }})</span>
        </template>

        <v-expansion-panel-text eager :style="{ maxHeight: '500px', overflowY: 'scroll' }">
          <VList>
            <template v-for="(log, index) in logs" :key="log.id">
              <VListItem class="log-list-item py-0">
                <template #prepend>
                  <span
                    class="text-uppercase mr-3 py-3 text-center border h-100"
                    :class="{
                      'text-primary': log.data.type === 'log',
                      'text-error': log.data.type === 'error',
                      'text-warning': log.data.type === 'warn',
                      'text-blue': log.data.type === 'debug',
                    }"
                    :style="{
                      width: '80px',
                      borderTopWidth: '0 !important',
                      borderBottomWidth: '0 !important',
                      borderLeftWidth: '0 !important',
                    }"
                  >
                    [{{ log.data.type }}]
                  </span>
                </template>
                <VListItemSubtitle class="pt-3">{{ log.data.timestamp }}</VListItemSubtitle>
                <VListItemTitle class="text-wrap pb-3">
                  {{ normalizeLog(log.data.messages) }}
                  <VBtn
                    v-if="log.data.messages.join().length > 200"
                    variant="plain"
                    :text="collapsed ? 'Show More' : 'Show Less'"
                    size="x-small"
                    color="link"
                    :ripple="false"
                    @click="collapsed = !collapsed"
                  />
                </VListItemTitle>
              </VListItem>
              <v-divider v-if="logs.length - 1 !== index" />
            </template>
          </VList>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { type LoggerInstance as LI, LoggerInterceptor } from "logger-interceptor";
import { ref } from "vue";

import { type Indexed, IndexedDBClient } from "@/clients";
import { useAsync } from "@/hooks";

const VERSION = 1;
const KEY = "TF_LOGGER_V." + VERSION;
const SIZE = window.env.PAGE_SIZE;

type LoggerInstance = Omit<LI, "logger" | "date">;

export default {
  name: "TfLogger",
  setup() {
    const logs = ref<Indexed<LoggerInstance>[]>([]);
    const interceptor = new LoggerInterceptor(console);

    const logsDBClient = new IndexedDBClient("TF_LOGGER_DB", VERSION, KEY);
    const connectDB = useAsync(() => logsDBClient.connect(), {
      init: true,
      onAfterTask({ error }) {
        if (error) {
          /* handle error */
          return;
        }
        logsCount.value.run();
      },
    });

    const count = ref(0);
    const logsCount = useAsync(() => logsDBClient.count(), {
      default: 0,
      onAfterTask({ data }) {
        count.value = data as number;
        if (data === 0) {
          page.value = -1;
          return;
        }

        loadLogs.value.run();
      },
    });

    const page = ref(1);
    const loadLogs = useAsync(async () => {
      const loadedLogs = await logsDBClient.read<LoggerInstance>(count.value - page.value * SIZE, SIZE);
      logs.value.unshift(...loadedLogs);
      page.value++;

      if (count.value - page.value * SIZE <= 0) {
        page.value = -1;
      }
    }, {});

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interceptor.on(async ({ logger: _, date: __, ...log }) => {
      if (import.meta.env.DEV) {
        if (log.messages.join().includes("vite")) {
          return;
        }
      }

      _.log(...log.messages);

      const item = await logsDBClient.write(log);
      count.value++;
      logs.value.push(item);
    });

    const collapsed = ref(true);
    function normalizeLog(msgs: any[]): string {
      const res = msgs.join(" ");
      if (collapsed.value && res.length > 200) {
        return res.slice(0, 200) + "...";
      }
      return res;
    }

    return {
      logs,
      collapsed,
      normalizeLog,
    };
  },
};
</script>

<style>
.log-list-item .v-list-item__prepend {
  width: auto !important;
  height: 100%;
}
</style>
