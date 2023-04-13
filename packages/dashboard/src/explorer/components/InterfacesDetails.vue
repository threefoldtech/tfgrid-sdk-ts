<template>
  <v-container>
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-boom-gate-outline</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> Interfaces Details </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <div style="max-height: 300px; overflow-y: auto">
      <v-list v-for="intf in interfaces" :key="intf.id" class="mb-6">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Name </v-list-item-title>
          </v-list-item-content>
          {{ intf.name }}
        </v-list-item>
        <v-divider />

        <v-list-item class="accountId">
          <v-list-item-content>
            <v-list-item-title> Mac Address </v-list-item-title>
          </v-list-item-content>
          {{ intf.mac }}
        </v-list-item>
        <v-divider />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> IPs </v-list-item-title>
          </v-list-item-content>
          {{ intf.ips.replace(",", " | ") }}
        </v-list-item>
        <v-divider />

        <!-- <DatesDetails :item="twin" /> -->
      </v-list>
    </div>
  </v-container>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { INode } from "../graphql/api";

@Component({})
export default class InterfacesDetails extends Vue {
  @Prop({ required: true }) interfaces!: INode["interfaces"];
}
</script>
