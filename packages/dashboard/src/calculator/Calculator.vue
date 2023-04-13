<template>
  <router-view />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class App extends Vue {}
</script>

<style>
[role="listitem"] {
  overflow-y: hidden;
  text-overflow: ellipsis;
}
</style>
