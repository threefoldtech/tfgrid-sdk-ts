<template>
  <v-card flat color="transparent" class="mb-6">
    <v-subheader>{{ label.toLocaleUpperCase() }}</v-subheader>

    <v-card-text class="pt-0">
      <v-row>
        <v-col class="col-11 pt-0">
          <v-range-slider v-model="range" :max="_max" :min="_min" hide-details class="align-center">
            <template v-slot:prepend>
              <template>
                <v-text-field
                  :value="get_value(range[0])"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  @input.native="validated($event.srcElement.value, key2)"
                  @input="onChange({ min: $event })"
                  style="width: 52px; text-align: center"
                ></v-text-field>
              </template>
            </template>
            <template v-slot:append>
              <template>
                <v-text-field
                  :value="get_value(range[1])"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 52px; text-align: center"
                  @input="onChange({ max: $event })"
                ></v-text-field>
              </template>
            </template>
          </v-range-slider>
        </v-col>
        <v-col class="col-1 px-0 pt-2">
          <span>{{ unit }}</span>
        </v-col>
      </v-row>
    </v-card-text>
    <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert>
  </v-card>
</template>
<script lang="ts">
import { MutationTypes } from "../store/mutations";
import { Component, Prop, Vue } from "vue-property-decorator";
import toTera from "../filters/toTera";
// import { inputValidation } from "../utils/validations"
@Component({})
export default class RangeFilter extends Vue {
  @Prop({ required: true }) key1!: string;
  @Prop({ required: true }) key2!: string;
  @Prop({ required: true }) label!: string;
  @Prop() min?: number;
  @Prop() max?: number;
  @Prop() unit?: string;
  get _min(): number {
    return this.min || 0;
  }
  get _max(): number {
    return this.max || Number.MAX_SAFE_INTEGER;
  }
  get range(): [number, number] {
    const { min, max } = this.$store.getters["explorer/getFilter"](this.key1, this.key2).value;
    return [min, max];
  }
  set range([min, max]: [number, number]) {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_VALUE, {
      key1: this.key1,
      key2: this.key2,
      value: { min, max },
    });
  }
  get_value(val: number) {
    const res = toTera(val.toString());
    return Number(res.split(" ")[0]).toFixed(0);
  }
  onChange({ min, max }: { min?: number; max?: number }) {
    const { unit, range: [__min, __max]} = this; // prettier-ignore
    const multiplier = unit === "TB" ? 1e12 * 1.024 : 1;
    this.range = [min ? min * multiplier : __min, max ? max * multiplier : __max];
  }
  errorMsg: any = "";
  validated(value: string, key: string) {
    if (+value < 0) {
      this.errorMsg = "Number must be positive.";
      return;
    }
    this.errorMsg = "";
  }
  created() {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_ENABLE, {
      key1: this.key1,
      key2: this.key2,
      value: true,
    });
  }
  destroyed() {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_ENABLE, {
      key1: this.key1,
      key2: this.key2,
      value: false,
    });
  }
}
</script>
