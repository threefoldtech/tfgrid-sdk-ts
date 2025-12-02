<template>
  <VBottomNavigation class="border" :height="debugOpened === 0 ? openHeight : undefined">
    <v-expansion-panels
      ref="panel"
      v-click-outside="bindDebugOpened"
      :model-value="debugOpened"
      :multiple="false"
      @update:model-value="bindDebugOpened"
    >
      <v-expansion-panel eager>
        <v-expansion-panel-title :class="{ 'text-error': !!connectDB.error }">
          <span class="text-subtitle-1"> <VIcon icon="mdi-cog" /> Dashboard Logs ({{ logs.length }}) </span>
          <template #actions>
            <div>
              <VTooltip text="Download Logs">
                <template #activator="{ props }">
                  <VBtn
                    class="text-link"
                    size="xs"
                    v-bind="props"
                    :disabled="!!connectDB.error || logs.length === 0"
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
                    :disabled="!!connectDB.error || logs.length === 0"
                    @click.stop="clearDialog = true"
                  >
                    <VIcon icon="mdi-cancel" />
                  </VBtn>
                </template>
              </VTooltip>
            </div>
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text v-if="!connectDB.error" eager class="debug-container">
          <DynamicScroller
            ref="scroller"
            :items="logs"
            :min-item-size="1"
            :style="{ height: openHeight - 64 + 'px', paddingBottom: '100px' }"
            @resize="scrollToBottom()"
          >
            <template #before>
              <div v-if="page !== -1" class="pa-2">
                <VBtn class="w-100 text-secondary" :loading="loadLogs.loading" variant="tonal" @click="loadLogs.run()">
                  Load More Logs
                </VBtn>
              </div>

              <v-divider />
            </template>

            <template #default="{ item, index, active }">
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
              <VBtn size="xs" variant="plain" text="Reconnect" @click="connectDB.run()" />
            </template>
          </VAlert>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </VBottomNavigation>
  <v-dialog v-model="clearDialog" max-width="400px" attach="#modals">
    <v-card>
      <VCardTitle v-text="'Clear Logs'" />
      <VCardText v-text="'This will delete all of your logs. Be careful this operation is irreversible!'" />
      <v-card-actions class="justify-end mb-1 mr-2">
        <v-btn color="anchor" text="Cancel" @click="clearDialog = false" />
        <v-btn color="error" text="clear" @click="clearLogs.run()" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import "vue3-virtual-scroller/dist/vue3-virtual-scroller.css";

import { type LoggerInstance as LI, LoggerInterceptor } from "logger-interceptor";
import { onBeforeUnmount, onMounted, ref } from "vue";
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
    const panel = ref();

    function bindDebugOpened(value?: any): void {
      // Check if value is not a number (handles click outside events)
      debugOpened.value = typeof value === "number" ? value : undefined;

      scroller.value?.scrollToBottom();

      const html = document?.querySelector("html");
      if (html) {
        if (value === 0) {
          return html.style.setProperty("overflow", "hidden");
        }

        html.style.removeProperty("overflow");
        return;
      }
    }

    const logs = ref<Indexed<LoggerInstance>[]>([]);

    /**
     * Keep a reference to the original console.error so that internal
     * logger failures don't recursively go through the interceptor and
     * generate more log entries.
     */
    const originalConsoleError = console.error.bind(console);

    const interceptor = new LoggerInterceptor(console);

    const logsDBClient = new IndexedDBClient("TF_LOGGER_DB", VERSION, KEY);
    const connectDB = useAsync(() => logsDBClient.connect(), {
      init: true,
      async onAfterTask({ error }) {
        if (error) {
          // Stop intercepting entirely on persistent DB failure.
          interceptor.dispose();
          return;
        }

        await lastRecordIndex.value.run();
        await logsCount.value.run();

        _interceptorQueue.forEach(interceptMessage);
        _interceptorQueue = [];
        if (logQueue.length > 0) flushLogQueue();
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
      if (connectDB && connectDB.value.error) {
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
        document?.querySelector("html")?.style.removeProperty("overflow");
        logsCount.value.run();
      },
    });

    interceptor.on(interceptMessage);

    let _interceptorQueue: LI[] = [];
    const logQueue: LI[] = [];
    let flushTimeout: ReturnType<typeof setTimeout> | null = null;
    const BATCH_SIZE = 50;
    const FLUSH_DELAY = 500;

    function scheduleFlush() {
      if (flushTimeout) return;
      flushTimeout = setTimeout(flushLogQueue, FLUSH_DELAY);
    }

    const MAX_VISIBLE_LOGS = 2000;
    const MAX_STORED_LOGS = 10000;
    const ROTATION_BUFFER = 1000;

    async function flushLogQueue() {
      if (logQueue.length === 0 || !connectDB?.value?.data) return;

      const batch = logQueue.splice(0, BATCH_SIZE);
      const items: Indexed<LoggerInstance>[] = [];

      for (const instance of batch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { logger: _, date: __, ...log } = instance;

        try {
          items.push(
            await logsDBClient.write({
              type: log.type,
              timestamp: log.timestamp,
              message: log.messages.map(IndexedDBClient.serializer.serialize).join(" ").replace(/\n\s/g, "\n"),
            }),
          );
        } catch (error) {
          // Use the original console.error to avoid re-interception.
          originalConsoleError("Failed to write log to IndexedDB:", error);
        }
      }

      if (items.length > 0 && logs.value) {
        logs.value.push(...items);
        if (logs.value.length > MAX_VISIBLE_LOGS) {
          logs.value.splice(0, logs.value.length - MAX_VISIBLE_LOGS);
        }
        scrollToBottom();
      }

      // Rotate old logs if count exceeds limit
      const currentCount = await logsDBClient.count();
      if (currentCount > MAX_STORED_LOGS) {
        const toDelete = currentCount - MAX_STORED_LOGS + ROTATION_BUFFER;
        try {
          await logsDBClient.deleteRange(1, toDelete);
          count.value = await logsDBClient.count();
        } catch (error) {
          originalConsoleError("Failed to rotate logs:", error);
        }
      }

      flushTimeout = logQueue.length > 0 ? setTimeout(flushLogQueue, FLUSH_DELAY) : null;
    }

    function interceptMessage(instance: LI) {
      // Drop very noisy categories early to avoid unnecessary work.
      const payload = instance.messages.map(String).join().toLowerCase();
      if (
        instance.type === "warn" &&
        (payload.includes("vue") || payload.includes("vite") || payload.includes("hmr"))
      ) {
        return;
      }

      if (connectDB?.value?.error) {
        _interceptorQueue.push(instance);
        return;
      }

      if (!connectDB?.value?.data) return;

      logQueue.push(instance);

      if (logQueue.length >= BATCH_SIZE) {
        flushTimeout && clearTimeout(flushTimeout);
        flushTimeout = null;
        return flushLogQueue();
      }

      scheduleFlush();
    }

    let _init_scroll = false;
    function scrollToBottom() {
      const el = scroller.value?.$el;
      if (!el || el.scrollHeight === 0 || el.offsetHeight === 0) return;
      if (_init_scroll && el.scrollTop !== el.scrollHeight - el.offsetHeight) return;

      _init_scroll = true;
      scroller.value?.scrollToBottom();
    }

    async function downloadLogs() {
      const logs = await logsDBClient.readAll<LoggerInstance>();

      let formatedLogs = "";

      for (const log of logs) {
        const spaces = " ".repeat(5 - log.type.length);
        formatedLogs += `[+] ${log.timestamp} [${log.type.toUpperCase()}]${spaces} ${log.message}\n`;
      }

      downloadAsFile("dashboard.log", formatedLogs);
    }

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
      if (flushTimeout) {
        clearTimeout(flushTimeout);
        flushLogQueue();
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (panel.value && !panel.value.$el.contains(event.target)) {
        debugOpened.value = undefined;
      }
    };

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
      panel,
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
