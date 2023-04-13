<template>
  <v-card flat color="transparent">
    <v-subheader>{{ label.toLocaleUpperCase() }}</v-subheader>
    <v-text-field
      type="text"
      :label="label"
      solo
      :prefix="prefix"
      clearable
      v-model="value"
      @input.native="validated($event.srcElement.value, key2)"
    />
    <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert>
  </v-card>
</template>
<script lang="ts">
import { MutationTypes } from "../store/mutations";
import { IState } from "../store/state";
import { IOP } from "../utils/filters";
import { Component, Prop, Vue } from "vue-property-decorator";
import { inputValidation } from "../utils/validations";
@Component({})
export default class ComparisonFilter extends Vue {
  @Prop({ required: true }) key1!: keyof IState["filters"];
  @Prop({ required: true }) key2!: string;
  @Prop({ required: true }) label!: string;
  @Prop({ required: true }) prefix!: IOP;
  get value() {
    return this.$store.getters["explorer/getFilter"](this.key1, this.key2).value;
  }
  set value(value: number) {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_VALUE, {
      key1: this.key1,
      key2: this.key2,
      value,
    });
  }
  created() {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_ENABLE, {
      key1: this.key1,
      key2: this.key2,
      value: true,
    });
  }
  errorMsg: any = "";
  validated(value: string, key: string): string {
    this.errorMsg = inputValidation(value, key);
    return this.errorMsg;
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
