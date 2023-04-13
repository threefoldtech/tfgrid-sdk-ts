<template>
  <v-combobox
    :value="value"
    @input="$emit('input', $event)"
    :items="items"
    chips
    solo
    multiple
    label="Please choose some filters."
    placeholder="Please choose some filters."
  >
    <template v-slot:selection="{ attrs, item, select, selected }">
      <!-- prettier-ignore -->
      <v-chip
        v-bind="attrs"
        :input-value="selected"
        close
        @click="select"
        @click:close="$emit('input', value.filter((x) => x !== item))"
        color="primary"
      >
        {{ item }}
      </v-chip>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "LayoutFilters",
})
export default class LayoutFilters extends Vue {
  @Prop({ required: true }) value!: string[];
  @Prop({ required: true }) items!: string[];
}
</script>
