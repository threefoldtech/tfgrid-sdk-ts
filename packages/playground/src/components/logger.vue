<template>
  <VBottomNavigation :height="debugOpened === 0 ? openHeight : undefined">
    <v-expansion-panels :model-value="debugOpened" @update:model-value="bindDebugOpened" :multiple="false">
      <v-expansion-panel eager>
        <v-expansion-panel-title>
          <span class="text-subtitle-1">Console Logs ({{ logs.length }})</span>
          <template v-slot:actions>
            <VTooltip text="Download Logs">
              <template #activator="{ props }">
                <VBtn class="text-link" size="xs" v-bind="props" :disabled="debugOpened !== 0" @click.stop>
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
                  :disabled="debugOpened !== 0"
                  @click.stop="clearLogs.run"
                >
                  <VIcon icon="mdi-cancel" />
                </VBtn>
              </template>
            </VTooltip>
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text eager class="debug-container">
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
      </v-expansion-panel>
    </v-expansion-panels>
  </VBottomNavigation>
</template>

<script lang="ts">
import "vue3-virtual-scroller/dist/vue3-virtual-scroller.css";

import { type LoggerInstance as LI, LoggerInterceptor } from "logger-interceptor";
import { ref } from "vue";
import { DynamicScroller, DynamicScrollerItem } from "vue3-virtual-scroller";

import { type Indexed, IndexedDBClient } from "@/clients";
import { useAsync } from "@/hooks";

import LogMessage from "./LogMessage.vue";

const VERSION = 1;
const KEY = "TF_LOGGER_V." + VERSION;
const SIZE = window.env.PAGE_SIZE;
const OPEN_HEIGHT = 600;

export type LoggerInstance = Omit<LI, "logger" | "date">;

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
    /* const connectDB =  */ useAsync(() => logsDBClient.connect(), {
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
      const start = Math.max(1, count.value - page.value * SIZE);
      const loadedLogs = await logsDBClient.read<LoggerInstance>(start, SIZE - 1);
      logs.value.unshift(...loadedLogs);
      page.value++;

      if (start === 1) {
        page.value = -1;
      }
    }, {});

    const clearLogs = useAsync(async () => await logsDBClient.clear(), {
      onAfterTask() {
        page.value = 1;
        logs.value = [];
        logsCount.value.run();
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interceptor.on(async ({ logger: _, date: __, ...log }) => {
      if (import.meta.env.DEV) {
        if (log.messages.join().includes("vite")) {
          return;
        }
      }

      const item = await logsDBClient.write(log);
      logs.value.push(item);
      scrollToBottom();
    });

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

    return {
      scroller,
      logs,
      count,
      debugOpened,
      bindDebugOpened,
      openHeight: OPEN_HEIGHT,
      scrollToBottom,
      page,
      loadLogs,
      clearLogs,
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
