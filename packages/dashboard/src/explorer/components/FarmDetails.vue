<template>
  <v-container>
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-webpack</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> Farm Details </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> ID </v-list-item-title>
        </v-list-item-content>
        {{ farm.farmId }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Name </v-list-item-title>
        </v-list-item-content>
        {{ farm.name }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Stellar Address </v-list-item-title>
        </v-list-item-content>
        <span style="width: 60%">{{ farm.stellarAddress || "None" }}</span>
      </v-list-item>
    </v-list>
  </v-container>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { IFarm } from "../graphql/api";

@Component({})
export default class FarmDetails extends Vue {
  @Prop({ required: true }) farm!: IFarm;
}
</script>
