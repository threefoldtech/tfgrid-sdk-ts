<template>
  <v-container>
    <h1>
      {{ pageName }}
    </h1>
    <v-divider />
    <br />
    <v-row>
      <v-col :cols="screen_max_1400 ? 12 : 3" :order="screen_max_1400 ? 1 : undefined" v-if="!noFilter">
        <h3>Filters</h3>
        <br />
        <v-row>
          <slot name="filters"></slot>
        </v-row>
        <v-row class="mt-2 mb-2 mr-2" justify="end">
          <slot name="apply-filters"></slot>
        </v-row>
        <br />
        <v-divider />
        <section class="filter-container" ref="container">
          <slot name="active-filters"></slot>
        </section>
      </v-col>
      <v-col :cols="screen_max_1400 ? 12 : 9" class="table-container">
        <slot name="table"></slot>
      </v-col>
    </v-row>
    <slot name="details"></slot>
    <slot></slot>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({})
export default class Layout extends Vue {
  @Prop({ required: true }) pageName!: string;
  @Prop({ default: false }) noFilter!: boolean;

  private _screen_max_1400?: MediaQueryList;
  screen_max_1400 = false;

  private _resizePanel() {
    const panel = this.$refs.container as HTMLElement;
    if (panel) {
      const maxHeight = this.screen_max_1400 ? 350 : panel.offsetTop + 20;
      panel.style.maxHeight = `calc(100vh - ${maxHeight}px)`;
    }
  }

  mounted() {
    this._screen_max_1400 = window.matchMedia("(max-width: 1400px)");
    this.screen_max_1400 = this._screen_max_1400.matches;
    this._screen_max_1400.onchange = e => {
      this.screen_max_1400 = e.matches;
      this._resizePanel();
    };

    this._resizePanel();
  }

  destroyed() {
    if (!this._screen_max_1400) return;
    this._screen_max_1400.onchange = null;
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-right: 10px;
  overflow-x: hidden;
  overflow-y: auto;
  will-change: transform;
  min-height: 100px;
}

.table-container {
  white-space: nowrap;
}
</style>
