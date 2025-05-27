<template>
  <v-dialog id="terms-dialog" :model-value="props.modelValue" persistent fullscreen width="100%" attach="#modals">
    <!-- Content card -->
    <v-card v-if="!loading" id="terms-dialog__card-content">
      <v-card-text id="terms-dialog__text-content" class="pa-15" v-html="acceptTermsContent"></v-card-text>
      <div id="terms-dialog__footer" class="terms-footer">
        <v-btn
          v-show="!loading"
          id="terms-dialog__go-back-button"
          class="mr-2"
          :color="theme.name.value === AppThemeSelection.light ? 'black' : 'white'"
          :text="capitalize('go back')"
          @click="emit('update:modelValue', false)"
        />
        <v-btn
          v-show="!loading"
          id="terms-dialog__accept-button"
          :text="capitalize('accept terms and conditions')"
          @click="emit('onAccept')"
        />
      </div>
    </v-card>
    <!-- Loading card -->
    <v-card v-else id="terms-dialog__card-loading" :style="{ height: '100%' }">
      <v-card-text
        id="terms-dialog__loading-content"
        class="d-flex justify-center align-center"
        :style="{ height: '100%' }"
      >
        <v-progress-circular id="terms-dialog__progress-indicator" indeterminate />
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
  let processedContent = content.replace(
    "./" + manual.legal_header_img,
    `${manual.manual_raw_legal_img}" class="info-legal-image`,
  );

  const patterns = [/\[([^\]]+)\]\((\.\/[^)]+)\.md\)/g, /\[([^\]]+)\]\((\.\/[^)]+\/[^)]+)\.md\)/g];
  for (const pattern of patterns) {
    processedContent = replaceMarkdownLinks(processedContent, pattern, baseUrl);
  }
  return processedContent;
};
const replaceMarkdownLinks = (content: string, pattern: RegExp, baseUrl: string) => {
  return content.replace(pattern, (_, linkText, path) => {
    const relativePath = path.replace("./", "");
    return `[${linkText}](${urlJoin(baseUrl, `${relativePath}.html`)})`;
  });
};
</script>
