<template>
  <v-container>
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-boom-gate-outline</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> GPU Details </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-card max-width="400px" max-height="100px">
      <v-data-table
        fixed-header
        class="elevation-1"
        align
        :headers="headers"
        :items="nodeGPU1"
        hide-default-footer
        :expanded="[expandedItem]"
        @click:row="toggleExpanded"
      >
        <template v-slot:expanded-item="{ item }">
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title>Vendor</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.vendor }}
              </v-list-item-subtitle>

              <v-list-item-title>Device</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.device }}
              </v-list-item-subtitle>

              <v-list-item-title>Rented by</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.contract }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { INodeGPU } from "../graphql/api";

@Component({})
export default class GPUDetails extends Vue {
  @Prop({ required: true }) nodeGPU!: INodeGPU[];
  headers = [{ text: "Card ID", value: "id" }];
  nodeGPU1 = [
    {
      id: "0000:0e:00.0/1002/744c",
      vendor: "Advanced Micro Devices, Inc. [AMD/ATI]",
      device: "Navi 31 [Radeon RX 7900 XT/7900 XTX]",
      contract: 31540,
    },
    {
      id: "0000:0e:00.0/100d2/744c",
      vendor: "Advanced Micro Devices, Inc. [AMD/ATI]",
      device: "Navi 31 [Radeon RX 7900 XT/7900 XTX]",
      contract: 31540,
    },
    {
      id: "0000:0e:00.0/1002s/744c",
      vendor: "Advanced Micro Devices, Inc. [AMD/ATI]",
      device: "Navi 31 [Radeon RX 7900 XT/7900 XTX]",
      contract: 31540,
    },
    {
      id: "0000:0e:00.0/100sa2/744c",
      vendor: "Advanced Micro Devices, Inc. [AMD/ATI]",
      device: "Navi 31 [Radeon RX 7900 XT/7900 XTX]",
      contract: 31540,
    },
  ];
  expandedItem: INodeGPU | null = null;
  toggleExpanded(item: INodeGPU) {
    console.log([item, item, item]);
    if (this.expandedItem === item) {
      this.expandedItem = null;
    } else {
      this.expandedItem = item;
    }
  }
}
</script>

<style>
.v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
  box-shadow: none;
}
</style>
