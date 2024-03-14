<template>
  <v-card flat color="transparent">
    <v-subheader>{{ label }}</v-subheader>
    <v-text-field
      v-model="item"
      chips
      clearable
      :label="placeholder"
      solo
      type="text"
      :rules="[validated(item, filterKey)]"
    />
    <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { ActionTypes } from "../store/actions";
import { MutationTypes } from "../store/mutations";
import { inputValidation } from "../utils/validations";

@Component({})
export default class InFilter extends Vue {
  @Prop({ required: true }) label!: string;
  @Prop({ required: true }) placeholder!: string;
  @Prop({ required: true }) filterKey!: string;
  @Prop() value?: string[];
  item = "";
  invalid = false;

  setItem(value: string) {
    if (!this.invalid) {
      // add the current filter key to the query.
      this.$store.commit("explorer/" + MutationTypes.SET_NODES_FILTER, {
        key: this.filterKey,
        value: [value],
      });
      // load nodes with the changes
      this.$store.dispatch(ActionTypes.REQUEST_NODES);
    }
  }

  remove(index: number): void {
    this.$store.getters["explorer/getNodesFilter"][this.filterKey].splice(index, 1);
    this.$store.dispatch(ActionTypes.REQUEST_NODES);
  }

  errorMsg: any = "";
  validated(value: string, key: string): string {
    if (!value) {
      // reset filter
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

  created() {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_ENABLE, {
      key1: "nodes",
      key2: this.filterKey,
      value: true,
    });
  }

  destroyed() {
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_ENABLE, {
      key1: "nodes",
      key2: this.filterKey,
      value: false,
    });
    this.$store.commit("explorer/" + MutationTypes.CLEAR_NODES_FILTER_KEY, this.filterKey);
  }
}
</script>
