<template>
  <v-dialog :model-value="props.modelValue" persistent fullscreen width="100%" attach="#modals" id="terms-dialog">
    <!-- Content card -->
    <v-card id="terms-dialog__card-content" v-if="!loading">
      <v-card-text class="pa-15" v-html="acceptTermsContent" id="terms-dialog__text-content"></v-card-text>
      <div class="terms-footer" id="terms-dialog__footer">
        <v-btn
          class="mr-2"
          id="terms-dialog__go-back-button"
          @click="emit('update:modelValue', false)"
          v-show="!loading"
          :color="theme.name.value === AppThemeSelection.light ? 'black' : 'white'"
          :text="capitalize('go back')"
        />
        <v-btn
          id="terms-dialog__accept-button"
          @click="emit('onAccept')"
          v-show="!loading"
          :text="capitalize('accept terms and conditions')"
        />
      </div>
    </v-card>
    <!-- Loading card -->
    <v-card id="terms-dialog__card-loading" v-else :style="{ height: '100%' }">
      <v-card-text
        class="d-flex justify-center align-center"
        :style="{ height: '100%' }"
        id="terms-dialog__loading-content"
      >
        <v-progress-circular indeterminate id="terms-dialog__progress-indicator" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import { marked } from "marked";
import urlJoin from "url-join";
import { capitalize, onMounted, ref } from "vue";
import { useTheme } from "vuetify";

import { AppThemeSelection } from "@/utils/app_theme";
import { manual } from "@/utils/manual";

const loading = ref(true);
const acceptTermsContent = ref("");
const theme = useTheme();

const props = defineProps({
  modelValue: {
    required: true,
    default: false,
    type: Boolean,
  },
});
const emit = defineEmits(["update:modelValue", "onAccept", "onError"]);

onMounted(async () => {
  try {
    const response = await fetch(manual.manual_raw_legal);
    const mdContent = await response.text();
    const processedContent = processMarkdownContent(mdContent, manual.manual_legal_base);
    acceptTermsContent.value = await marked.parse(processedContent);
  } catch (error) {
    console.error(error);
    emit("onError", "Something went wrong while loading terms and conditions, please try again");
  } finally {
    loading.value = false;
  }
});
const processMarkdownContent = (content: string, baseUrl: string) => {
  // Remove frontmatter if present
  let processedContent = content.replace(/^---\s*\ntitle:[^\n]*\nsidebar_position:[^\n]*\n---\s*\n/m, "");

  // Replace image path
  processedContent = processedContent.replace(
    /!\[legal\]\(\.\/(img\/legal_header\.jpg)\)/,
    `<img src="${manual.manual_raw_legal_img}" alt="ThreeFold Legal Picture" class="info-legal-image">`,
  );

  const patterns = [
    /\[([^\]]+)\]\((\.\/[^)]+)\)/g,
    /\[([^\]]+)\]\((\.\/[^)]+\/[^)]+)\)/g,
    /\[([^\]]+)\]\((\.\/[^)]+)\.md\)/g,
    /\[([^\]]+)\]\((\.\/[^)]+\/[^)]+)\.md\)/g,
  ];

  for (const pattern of patterns) {
    processedContent = replaceMarkdownLinks(processedContent, pattern, baseUrl);
  }

  return processedContent;
};
const replaceMarkdownLinks = (content: string, pattern: RegExp, baseUrl: string) => {
  return content.replace(pattern, (_, linkText, path) => {
    const relativePath = path.replace("./", "");
    const correctedBaseUrl = baseUrl.replace("/docs", "");
    return `[${linkText}](${urlJoin(correctedBaseUrl, relativePath)})`;
  });
};
</script>