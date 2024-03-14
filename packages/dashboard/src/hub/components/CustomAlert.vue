<template>
  <div class="mt-10" v-if="!loading">
    <v-alert type="error" border="left" outlined v-if="error">
      {{ error }}
    </v-alert>

    <v-alert type="success" border="left" outlined v-if="result">
      {{ result }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "CustomAlert",
})
export default class CustomAlert extends Vue {
  @Prop({ required: true }) loading!: boolean;
  @Prop({ required: true }) result!: string;
  @Prop({ required: true }) error!: string;
}
</script>
