<template>
  <v-card flat color="transparent">
    <v-subheader>{{ label.toLocaleUpperCase() }}</v-subheader>
    <v-combobox
      v-model="items"
      :items="_values"
      chips
      clearable
      :label="label"
      multiple
      prefix="in:"
      solo
      type="text"
      @input.native="validated($event.srcElement.value, key2)"
    >
      <template v-slot:selection="{ attrs, item, select, selected }">
        <v-chip v-bind="attrs" :input-value="selected" close @click="select" @click:close="remove(item)">
          <strong>{{ item }}</strong>
        </v-chip>
      </template>
    </v-combobox>
    <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert>
  </v-card>
</template>
<script lang="ts">
import { MutationTypes } from "../store/mutations";
import { IState } from "../store/state";
import { Component, Prop, Vue } from "vue-property-decorator";
import { inputValidation } from "../utils/validations";
@Component({})
export default class InFilter extends Vue {
  @Prop({ required: true }) key1!: keyof IState["filters"];
  @Prop({ required: true }) key2!: string;
  @Prop({ required: true }) label!: string;
  @Prop() value?: string[];
  get _values(): (string | number)[] {
    if (this.value) {
      return this.value;
    }
    return this.$store.getters["explorer/" + this.key1]
      .filter((e: any) => {
        if (e[this.key2]) {
          return e[this.key2];
        }
      })
      .map((e: any) => e[this.key2]);
  }
  get items(): string[] {
    return this.$store.getters["explorer/getFilter"](this.key1, this.key2).value;
  }
  set items(value: string[]) {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_VALUE, {
      key1: this.key1,
      key2: this.key2,
      value,
    });
  }
  remove(item: string): void {
    const items = this.items;
    const idx = items.findIndex(i => i == item);
    if (idx > -1) {
      items.splice(idx, 1);
      this.items = items;
    }
  }
  errorMsg: any = "";
  validated(value: string, key: string): string {
    this.errorMsg = inputValidation(value, key);
    return this.errorMsg;
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
