<template>
  <div>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <div class="circle-container" v-bind="attrs" v-on="on">
          <v-progress-circular
            v-for="vote in votes"
            class="circle"
            :size="24"
            :width="12"
            :rotate="vote.start * 360"
            :value="vote.end * 100"
            :color="vote.color"
            :key="vote.color"
          />
        </div>
      </template>

      <span>
        Yes: <strong>{{ total ? (votes[0].end * 100).toFixed(2) : 0 }}%</strong>
      </span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "VoteCircle",
})
export default class VoteCircle extends Vue {
  private readonly colors = ["#1982b1", "#e74c3c", "#c0392b"]; // prettier-ignore
  @Prop({ required: true }) yes!: number;
  @Prop({ required: true }) no!: number;
  @Prop({ required: true }) noWithVeto!: number;

  get total(): number {
    const { yes, no, noWithVeto } = this;
    return yes + no + noWithVeto;
  }

  get votes() {
    const { total, yes, no, noWithVeto, colors } = this;

    if (total === 0) {
      return [{ color: "", start: 0, end: 1 }];
    }

    return [
      { color: colors[0], start: 0, end: yes / total },
      { color: colors[1], start: yes / total, end: no / total },
      { color: colors[2], start: (yes + no) / total, end: noWithVeto / total },
    ];
  }
}
</script>

<style lang="scss">
.circle-container {
  position: relative;
  height: 24px;
  width: 24px;

  .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .v-progress-circular {
    circle:first-of-type {
      stroke: transparent;
    }
  }
}
</style>
