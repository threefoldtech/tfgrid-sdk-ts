<template>
  <VBottomNavigation :height="debugOpened === 0 ? openHeight : undefined">
    <v-expansion-panels :model-value="debugOpened" @update:model-value="bindDebugOpened" :multiple="false">
      <v-expansion-panel eager>
        <v-expansion-panel-title :class="{ 'text-error': !!connectDB.error }">
          <span class="text-subtitle-1"> Dashboard Logs ({{ logs.length }}) </span>
          <template v-slot:actions>
            <VTooltip text="Download Logs">
              <template #activator="{ props }">
                <VBtn
                  class="text-link"
                  size="xs"
                  v-bind="props"
                  :disabled="!!connectDB.error || debugOpened !== 0 || logs.length === 0"
                  @click.stop="downloadLogs"
                >
                  <VIcon icon="mdi-download" />
                </VBtn>
              </template>
            </VTooltip>
            <VTooltip text="Clear Logs">
              <template #activator="{ props }">
                <VBtn
                  class="text-error"
                  size="xs"
                  v-bind="props"
                  :disabled="!!connectDB.error || debugOpened !== 0 || logs.length === 0"
                  @click.stop="clearDialog = true"
                >
                  <VIcon icon="mdi-cancel" />
                </VBtn>
              </template>
            </VTooltip>
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text eager class="debug-container" v-if="!connectDB.error">
          <DynamicScroller
            ref="scroller"
            :items="logs"
            :min-item-size="1"
            :style="{ height: openHeight - 64 + 'px', paddingBottom: '100px' }"
            @resize="scrollToBottom()"
          >
            <template #before>
              <div class="pa-2" v-if="page !== -1">
                <VBtn class="w-100 text-secondary" :loading="loadLogs.loading" variant="tonal" @click="loadLogs.run()">
                  Load More Logs
                </VBtn>
              </div>

              <v-divider />
            </template>

            <template v-slot="{ item, index, active }">
              <DynamicScrollerItem :item="item" :active="active" :data-index="index" tag="v-list-item">
                <LogMessage :log="item" />
                <v-divider />
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </v-expansion-panel-text>

        <v-expansion-panel-text v-else>
          <VAlert type="error" variant="tonal">
            <span class="text-body-2">Failed to connect to logs database.</span>

            <template #append>
              <VBtn size="xs" variant="plain" @click="connectDB.run()" text="Reconnect" />
            </template>
          </VAlert>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </VBottomNavigation>

  <v-dialog max-width="400px" v-model="clearDialog">
    <v-card>
      <VCardTitle v-text="'Clear Logs'" />
      <VCardText v-text="'This will delete all your logs. Be careful this operation is irreversible!'" />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="clearDialog = false" text="Cancel" />
        <v-btn variant="outlined" color="error" @click="clearLogs.run()" text="clear" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import "vue3-virtual-scroller/dist/vue3-virtual-scroller.css";

import { type LoggerInstance as LI, LoggerInterceptor } from "logger-interceptor";
import { ref } from "vue";
import { DynamicScroller, DynamicScrollerItem } from "vue3-virtual-scroller";

import { type Indexed, IndexedDBClient } from "@/clients";
import { useAsync } from "@/hooks";
import { downloadAsFile } from "@/utils/helpers";

import LogMessage from "./LogMessage.vue";
const clearDialog = ref(false);
const VERSION = 1;
const KEY = "TF_LOGGER_V." + VERSION;
const SIZE = window.env.PAGE_SIZE;
const OPEN_HEIGHT = 600;

export type LoggerInstance = Omit<LI & { message: string }, "logger" | "date" | "messages">;

export default {
  name: "TfLogger",
  components: { DynamicScroller, DynamicScrollerItem, LogMessage },
  setup() {
    const scroller = ref();
    const debugOpened = ref<number>();
    function bindDebugOpened(value?: any): void {
      debugOpened.value = value;

      if (document !== null) {
        if (value === 0) {
          return document.querySelector("html")?.classList.add("v-overlay-scroll-blocked");
        }

        return document.querySelector("html")?.classList.remove("v-overlay-scroll-blocked");
      }
    }

    const logs = ref<Indexed<LoggerInstance>[]>([]);
    const interceptor = new LoggerInterceptor(console);

    const logsDBClient = new IndexedDBClient("TF_LOGGER_DB", VERSION, KEY);
    const connectDB = useAsync(() => logsDBClient.connect(), {
      init: true,
      async onAfterTask({ error }) {
        if (error) {
          return;
        }

        await lastRecordIndex.value.run();
        await logsCount.value.run();

        _interceptorQueue.forEach(interceptMessage);
        _interceptorQueue = [];
      },
    });

    const lastRecordIndex = useAsync(() => logsDBClient.getLastRecordIndex());

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
      if (connectDB.value.error) {
        return;
      }

      const lastIndex = lastRecordIndex.value.data as number;
      const countReset = Math.max(1, count.value - page.value * SIZE);

      const start = Math.max(1, lastIndex - page.value * SIZE + 1);

      const loadedLogs = await logsDBClient.read<LoggerInstance>(start, SIZE - 1);
      logs.value.unshift(...loadedLogs);
      page.value++;

      if (countReset === 1) {
        page.value = -1;
      }
    }, {});

    const clearLogs = useAsync(async () => await logsDBClient.clear(), {
      onAfterTask() {
        clearDialog.value = false;
        debugOpened.value = undefined;
        page.value = 1;
        logs.value = [];
        logsCount.value.run();
      },
    });

    interceptor.on(interceptMessage);

    // This should be used if db failed to connect to be synced later
    let _interceptorQueue: LI[] = [];

    async function interceptMessage(instance: LI) {
      if (connectDB.value.error) {
        _interceptorQueue.push(instance);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { logger: _, date: __, ...log } = instance;

      if (import.meta.env.DEV) {
        if (log.messages.map(String).join().includes("vite")) {
          return;
        }
      }

      const item = await logsDBClient.write({
        type: log.type,
        timestamp: log.timestamp,
        message: log.messages.map(IndexedDBClient.serializer.serialize).join(" ").replace(/\n\s/g, "\n"),
      });

      logs.value.push(item);
      scrollToBottom();
    }

    let _init_scroll = false;
    function scrollToBottom() {
      const el = scroller.value?.$el;
      if (!el || el.scrollHeight === 0 || el.offsetHeight === 0) {
        return;
      }

      if (!_init_scroll || el.scrollTop === el.scrollHeight - el.offsetHeight) {
        _init_scroll = true;
        scroller.value?.scrollToBottom();
      }
    }

    async function downloadLogs() {
      const logs = await logsDBClient.readAll<LoggerInstance>();

      let formatedLogs = "";

      for (const log of logs) {
        const spaces = " ".repeat(5 - log.type.length);
        formatedLogs += `[+] ${log.timestamp} [${log.type.toUpperCase()}]${spaces} ${log.message}\n`;
      }

      downloadAsFile("dashboard.logs", formatedLogs);
    }

    return {
      connectDB,
      scroller,
      clearDialog,
      logs,
      count,
      debugOpened,
      bindDebugOpened,
      openHeight: OPEN_HEIGHT,
      scrollToBottom,
      page,
      loadLogs,
      clearLogs,
      downloadLogs,
    };
  },
};
</script>

<style>
.log-list-item .v-list-item__prepend {
  width: auto !important;
  height: 100%;
}

.debug-container .v-expansion-panel-text__wrapper {
  padding: 0;
}
</style>
