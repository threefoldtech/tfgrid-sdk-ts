<template>
  <v-card flat color="transparent">
    <v-subheader>{{ label.toLocaleUpperCase() }}</v-subheader>
    <v-combobox
      v-model="items"
      :items="_values"
      chips
      clearable
      :label="placeholder"
      :multiple="multiple"
      solo
      type="text"
      @input.native="validated($event.srcElement.value, filterKey)"
    >
      <template v-slot:selection="{ attrs, item, select, selected, index }">
        <v-chip v-bind="attrs" :input-value="selected" :close="multiple" @click="select" @click:close="remove(index)">
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { inputValidation } from "../utils/validations";
import { ActionTypes } from "../store/actions";

@Component({})
export default class InFilter extends Vue {
  @Prop({ required: true }) label!: string;
  @Prop({ required: true }) placeholder!: string;
  @Prop({ required: true }) filterKey!: string;
  @Prop() value?: string[];

  invalid = false;

  get multiple() {
    return this.filterKey == "farm_ids";
  }

  get _values(): (string | number)[] {
    // values are the suggested options; not needed for now.
    return [];
  }

  get items(): string[] {
    return this.$store.getters["explorer/getNodesFilter"][this.filterKey];
  }

  set items(value: string[]) {
    if (!this.invalid) {
      // add the current filter key to the query.
      this.$store.commit("explorer/" + MutationTypes.SET_NODES_FILTER, {
        key: this.filterKey,
        value,
      });
      // reset to the first page
      this.$store.commit("explorer/" + MutationTypes.SET_NODES_TABLE_PAGE_NUMBER, 1);
      // load nodes with the changes
      this.$store.dispatch(ActionTypes.REQUEST_NODES);
    }
  }

  remove(index: number): void {
    this.$store.getters["explorer/getNodesFilter"][this.filterKey].splice(index, 1);

    this.$store.commit("explorer/" + MutationTypes.SET_NODES_TABLE_PAGE_NUMBER, 1);
    this.$store.dispatch(ActionTypes.REQUEST_NODES);
  }

  @Watch("errorMsg", { immediate: true }) onErrorMsg(value: string) {
    if (value != "") {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  errorMsg: any = "";
  validated(value: string, key: string): string {
    this.errorMsg = inputValidation(value, key);
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
    this.$store.commit("explorer/" + MutationTypes.SET_NODES_TABLE_PAGE_NUMBER, 1);
    this.$store.dispatch(ActionTypes.REQUEST_NODES);
  }
}
</script>
