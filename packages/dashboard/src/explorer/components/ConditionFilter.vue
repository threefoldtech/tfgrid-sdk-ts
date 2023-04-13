<template>
  <v-card flat color="transparent">
    <v-subheader>{{ labels[0].toLocaleUpperCase() }}</v-subheader>

    <v-row align="center">
      <span class="ml-8">
        {{ labels[1] }}
      </span>
      <v-switch v-model="value" class="px-8"></v-switch>
      <span>
        {{ labels[2] }}
      </span>
    </v-row>
  </v-card>
</template>
<script lang="ts">
import { MutationTypes } from "../store/mutations";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({})
export default class ConditionFilter extends Vue {
  @Prop({ required: true }) key1!: string;
  @Prop({ required: true }) key2!: string;
  @Prop({ required: true }) labels!: string[];

  get value(): boolean {
    return this.$store.getters["explorer/getFilter"](this.key1, this.key2).value;
  }

  set value(value: boolean) {
    const { key1, key2 } = this;
    const data = { key1, key2, value };
    this.$store.commit("explorer/" + MutationTypes.SET_FILTER_VALUE, data);
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
