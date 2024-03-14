<template>
  <v-card flat color="transparent" tag="div">
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-expansion-card-variant</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> GPU Details </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <!-- Details -->
    <v-row>
      <v-col cols="12" class="pt-0">
        <!-- :cols="screen_max_800.matches ? 12 : screen_max_1000.matches ? 6 : 4" -->
        <v-list v-if="gpuItem != null && nodeGPUitems != null">
          <v-list-item>
            <v-list-item-content>
              <v-tooltip top nudge-bottom="30">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item-title class="pt-3" v-bind="attrs" v-on="on"
                    >Card ID
                    <v-chip
                      lose-icon="mdi-delete"
                      :color="gpuItem.contract ? 'warning' : 'success'"
                      small
                      class="mb-1 ml-2"
                      >{{ gpuItem.contract ? "Reserved" : "Available" }}</v-chip
                    >
                  </v-list-item-title>
                </template>
                <span>Card id that's used in a deployment</span>
              </v-tooltip>
            </v-list-item-content>
            <v-col class="mr-n4">
              <v-select
                v-if="nodeGPUitems.length > 1"
                append-outer-icon="mdi-content-copy"
                hide-details
                solo
                v-model="gpuItem"
                :items="nodeGPUitems"
                @input.native="gpuItem = $event.srcElement.value.value"
                @click:append-outer="copy(gpuItem.id)"
              />
              <v-text-field
                v-else
                :value="gpuItem.id"
                readonly
                hide-details
                append-outer-icon="mdi-content-copy"
                @click:append-outer="copy(gpuItem.id)"
                solo
              ></v-text-field>
            </v-col>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Vendor </v-list-item-title>
            </v-list-item-content>
            {{ gpuItem?.vendor }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Device </v-list-item-title>
            </v-list-item-content>
            {{ gpuItem?.device }}
          </v-list-item>
          <v-divider />
          <v-list-item v-if="gpuItem.contract !== undefined">
            <v-tooltip top nudge-bottom="30">
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-content v-bind="attrs" v-on="on">
                  <v-list-item-title> Contract ID</v-list-item-title>
                </v-list-item-content>
              </template>
              <span>The contract id that reserves this GPU card</span>
            </v-tooltip>
            {{ gpuItem?.contract }}
          </v-list-item>
          <v-divider />
        </v-list>
        <v-sheet v-else class="d-flex justify-center align-center pt-0" height="230">
          <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate></v-progress-circular>
            <p class="pt-2">Loading GPU details</p>
          </div>
          <div v-else class="text-center">
            <v-alert class="ma-2" dense outlined type="error">
              Failed to get node GPUs' information
              <template v-slot:append>
                <v-icon class="ml-2 mt-1" @click="loadGpuDetails">mdi-reload</v-icon>
              </template>
            </v-alert>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { getNodeGPUs } from "../../portal/lib/nodes";
import { INodeGPU } from "../graphql/api";

@Component({})
export default class GPUDetails extends Vue {
  @Prop({ required: true }) nodeId!: number;
  nodeGPUitems: { text: string; value: INodeGPU; disabled: false }[] | null = null;
  gpuItem: INodeGPU | null = null;
  loading = true;
  copy(id: string) {
    navigator.clipboard.writeText(id);
  }
  async loadGpuDetails() {
    this.loading = true;
    await getNodeGPUs(this.nodeId)
      .then(result => {
        if (!result) return;
        this.nodeGPUitems = result?.map((item: INodeGPU) => {
          return {
            text: item.id,
            value: item,
            disabled: false,
          };
        });
        this.gpuItem = result[0];
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        this.loading = false;
      });
  }
  async mounted() {
    await this.loadGpuDetails();
  }
}
</script>

<style>
.v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
  box-shadow: none;
}
</style>
