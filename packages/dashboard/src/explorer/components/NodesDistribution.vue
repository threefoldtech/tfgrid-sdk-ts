<template>
  <v-card flat color="transparent">
    <div @mousemove="controllTooltip($event)">
      <Map v-on:map-ref="onGetMapRef" />

      <div ref="tooltip" :style="'display: ' + display">
        <v-card class="tooltip">
          <p>{{ country }}</p>
          <p><span>No.of nodes:</span> {{ value || 0 }}</p>
        </v-card>
      </div>
    </div>
  </v-card>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import Map from "./Map.vue";
import { createPopper, Instance } from "@popperjs/core/lib/popper-lite";
import { byCountry } from "country-code-lookup";

function generateGetBoundingClientRect(x = 0, y = 0) {
  return () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });
}

interface INodesDistribution {
  [key: string]: number;
}

@Component({
  components: {
    Map,
  },
})
export default class NodesDistribution extends Vue {
  display: "none" | "block" = "none";
  @Prop({ required: true }) nodes!: INodesDistribution;
  country = "";
  value = "";

  @Watch("nodes", { immediate: true })
  onNodeChange(nodes: INodesDistribution) {
    if (!this.map) return;
    for (const path of this.map.querySelectorAll("path")) {
      path.removeAttribute("fill");
    }
    if (nodes) this._colorizeMap(nodes);
  }

  map?: SVGElement;
  onGetMapRef(map: SVGElement) {
    this.map = map;
  }

  controllTooltip(e: MouseEvent) {
    // hide/show tooltip
    if (!this.map || !this._instance || !this._virtualElement || !(e.target instanceof SVGPathElement)) {
      return (this.display = "none");
    }
    this.display = "block";

    // extract data
    const { clientX: x, clientY: y, target } = e;
    this.country = target.getAttribute("title")!;
    this.value = target.getAttribute("data-value")!;

    this._virtualElement.getBoundingClientRect = generateGetBoundingClientRect(x, y - 10);
    this._instance.update();
  }

  private _colorizeMap(counter: INodesDistribution) {
    if (!this.map) return;

    const max = Math.max(...Object.values(counter));
    console.log({ max }, Object.values(counter));

    // Range: [0, 1]
    // value / max = opacity
    // color = rgb(255 82 82)

    for (const key in counter) {
      const path = this.map.querySelector(`path[title='${key}']`);

      if (!path) continue;
      path.setAttribute("fill", `rgba(82, 255, 82, ${0.5 + counter[key] / (max * 2)})`);
      path.setAttribute("data-value", `${counter[key]}`);
    }

    this._createTooltip();
  }

  // tooltip main configs
  // using popper
  private _virtualElement?: {
    getBoundingClientRect: ReturnType<typeof generateGetBoundingClientRect>;
  };

  private _instance?: Instance;
  private _createTooltip() {
    if (!this.map) return;

    this._virtualElement = {
      getBoundingClientRect: generateGetBoundingClientRect(),
    };

    this._instance = createPopper(this._virtualElement as any, this.$refs.tooltip as any, {
      placement: "top",
    });
  }

  destroyed() {
    this._instance?.destroy();
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding-top: 50px;

  h2 {
    margin-top: 20px;
  }

  path:hover {
    fill: red;
  }
}

.tooltip {
  padding: 15px;
  border-radius: 5px;

  p {
    margin: 0;
    font-size: 20px;

    &:first-of-type {
      font-weight: bold;
    }
  }
}
</style>
