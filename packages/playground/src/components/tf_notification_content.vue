<template>
  <div class="mosha__toast__content">
    {{ content }}
    <v-spacer />
  </div>
  <button class="link-color" :onclick="() => router.push($props.link)">{{ linkContent }}</button>
</template>

<script lang="ts">
import router from "@/router";

export default {
  props: ["content", "link", "linkContent"],

  setup() {
    return {
      router,
    };
  },
};
</script>

<style scoped>
.link-color {
  color: var(--link-color);
}
.mosha__toast__slot-wrapper {
  line-height: 15px !important;
}
</style>
