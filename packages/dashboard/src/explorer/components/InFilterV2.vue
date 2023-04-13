<template>
  <v-card flat color="transparent">
    <v-subheader>{{ options.label.toLocaleUpperCase() }}</v-subheader>
    <v-combobox
      :items="searchItems"
      chips
      clearable
      :label="options.label"
      solo
      :type="options.type ? options.type : 'text'"
      :loading="loading"
      @keydown="search"
      v-model="content"
      :multiple="options.multiple"
      @click:clear="() => (errorMsg = '')"
      @input.native="validated($event.srcElement.value, options.key)"
    />
    <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert>
  </v-card>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import IFilterOptions from "../types/FilterOptions";
import { debounce } from "lodash";
import { inputValidation } from "../utils/validations";
type TContent = string | number | Array<string | number>;
@Component({
  name: "InFilterV2",
})
export default class InFilterV2 extends Vue {
  @Prop({ required: true }) options!: IFilterOptions;
  loading = false;
  searchItems: (string | number)[] = [];
  // Handling number case
  private _content!: TContent;
  get content(): TContent { return this._content; } // prettier-ignore
  set content(value: TContent) {
    if (this.options.type === "number") {
      value = Array.isArray(value) ? value.map(x => +x) : +value;
    }
    this._content = value;
    this.$emit("input", this._content);
  }
  public search = debounce(this._search.bind(this), 1000);
  private _search({ target }: { target: HTMLInputElement }) {
    this.loading = true;
    this.options
      .items(target.value)
      .then((res: any) => {
        this.searchItems = res;
      })
      .catch(() => null)
      .finally(() => {
        this.loading = false;
      });
  }
  public created() {
    if (this.options.init) {
      this._search({ target: { value: null } } as any);
    }
  }
  @Watch("errorMsg", { immediate: true }) onErrorMsg(value: string) {
    this.$emit("invalid", { invalid: value != "", symbol: this.options.symbol });
  }
  errorMsg: any = "";
  validated(value: string, key: string): string {
    this.errorMsg = inputValidation(value, key);
    return this.errorMsg;
  }
}
</script>
