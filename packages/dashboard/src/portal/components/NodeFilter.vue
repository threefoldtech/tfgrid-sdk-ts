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
    <!-- <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert> -->
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

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

  created() {
    console.log("Created...");
  }

  destroyed() {
    console.log("Destroyed...");
  }

  setItem(value: string) {
    console.log("Set item value: ", value);

    this.$store.commit("portal/" + MutationTypes.SET_DEDICATED_NODES_FILTER, {
      key: this.filterKey,
      value: [value],
    });

    this.$store.dispatch("portal/" + ActionTypes.REQUEST_DEDICATED_NODES);

    if (!this.invalid) {
      // add the current filter key to the query.
      // load nodes with the changes
      // this.$store.dispatch(ActionTypes.REQUEST_NODES);
    }
  }

  remove(index: number): void {
    this.$store.dispatch("explorer/removeFilterItem", { filterKey: this.filterKey, index });
    // this.$store.dispatch(ActionTypes.REQUEST_NODES);
  }

  validated(value: string, key: string): string | null {
    console.log("key: ", key);
    console.log("value: ", value);

    if (!value) {
      // reset filter
      this.setItem("");
      return (this.errorMsg = "");
    }
    // this.errorMsg = inputValidation(value, key);
    if (!this.errorMsg) {
      this.invalid = false;
      this.setItem(value);
    } else {
      this.invalid = true;
    }
    return this.errorMsg;
  }
}
</script>
