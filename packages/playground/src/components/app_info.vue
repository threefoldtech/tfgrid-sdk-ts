<template>
  <v-tooltip location="left" :text="tooltip">
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="tonal" color="anchor" icon="mdi-information-outline" @click="setOpenInfo(true)" />
    </template>
  </v-tooltip>

  <v-dialog
    :model-value="openInfo"
    @update:model-value="setOpenInfo($event)"
    :width="loading ? 'auto' : '60%'"
    scrollable
    attach="#modals"
  >
    <v-card v-if="loading" class="d-flex justify-center align-center pa-10">
      <v-progress-circular indeterminate />
    </v-card>
    <v-card v-else class="markdown">
      <v-card-title class="font-weight-bold d-flex align-center text-h5 my-2" v-if="title">
        {{ title }}
      </v-card-title>
      <v-card-subtitle :style="{ whiteSpace: 'initial' }" v-if="subtitle">{{ subtitle }}</v-card-subtitle>
      <v-divider v-if="title || subtitle" />
      <v-card-text class="pb-8" v-html="html" />

      <v-divider class="mb-2" />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="anchor" class="mr-2 my-1" @click="setOpenInfo(false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import fm from "front-matter";
import { marked } from "marked";
import { computed, type ComputedRef, ref } from "vue";
import { useRoute } from "vue-router";

import type { InfoMeta } from "../router";

export interface InfoFileMeta {
  title?: string;
  subtitle?: string;
}

export default {
  name: "AppInfo",
  setup() {
    const route = useRoute();
    const info = computed(() => route.meta.info || {}) as ComputedRef<InfoMeta>;

    const openInfo = ref(false);
    const loading = ref(false);
    const title = ref("");
    const subtitle = ref("");
    const html = ref("");

    async function setOpenInfo(value: boolean) {
      openInfo.value = value;

      if (value) {
        loading.value = true;
        const res = await fetch(import.meta.env.BASE_URL + info.value.page);
        const markdown = await res.text();

        const { attributes, body } = fm<InfoFileMeta>(markdown);

        title.value = attributes.title || "";
        subtitle.value = attributes.subtitle || "";
        html.value = marked.parse(body);

        loading.value = false;
      }
    }

    return {
      tooltip: computed(() => info.value.tooltip || "Show Details"),
      openInfo,
      loading,
      title,
      subtitle,
      html,
      setOpenInfo,
    };
  },
};
</script>

<style lang="scss">
.markdown {
  p {
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }

  ul {
    list-style: square;
    padding-left: 1rem;

    li {
      opacity: 0.8;
    }
  }
}
</style>
