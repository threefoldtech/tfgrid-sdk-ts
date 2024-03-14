<template>
  <v-card flat color="transparent">
    <v-subheader>{{ label.toLocaleUpperCase() }}</v-subheader>
    <v-text-field
      v-model="item"
      chips
      clearable
      :label="placeholder"
      solo
      type="text"
      :rules="[validated(item, filterKey)]"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { inputValidation } from "@/explorer/utils/validations";

import { ActionTypes } from "../store/actions";
import { MutationTypes } from "../store/mutations";

@Component({})
export default class InFilter extends Vue {
  @Prop({ required: true }) label!: string;
  @Prop({ required: true }) placeholder!: string;
  @Prop({ required: true }) filterKey!: string;
  @Prop() value?: string[];
  item = "";
  invalid = false;
  errorMsg: string | null = null;

  setItem(value: string) {
    this.$store.commit(`portal/${MutationTypes.SET_DEDICATED_NODES_FILTER}`, {
      key: this.filterKey,
      value: value,
    });

    if (!this.invalid) {
      this.$store.dispatch(`portal/${ActionTypes.REQUEST_DEDICATED_NODES}`);
    }
  }

  validated(value: string, key: string): string | null {
    if (!value) {
      this.setItem("");
      return (this.errorMsg = "");
    }
    this.errorMsg = inputValidation(value, key);
    if (!this.errorMsg) {
      this.invalid = false;
      this.setItem(value);
    } else {
      this.invalid = true;
    }
    return this.errorMsg;
  }

  destroyed() {
    this.$store.commit("portal/" + MutationTypes.CLEAR_DEDICATED_NODES_FILTER_KEY, this.filterKey);
  }
}
</script>
