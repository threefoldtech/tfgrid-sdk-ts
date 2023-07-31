<template>
  <v-row class="ma-2">
    <v-col :cols="colSize">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-harddisk</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Node Resources </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Details -->
        <v-row>
          <v-col cols="12">
            <v-list color="transparent">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> CPU </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.cru }} CPU
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Disk (HDD) </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.hru }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Disk (SSD) </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.sru }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Memory </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.mru }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col :cols="colSize">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-map-marker</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Location </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Details -->
        <v-row>
          <v-col cols="12">
            <v-list color="transparent">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Country </v-list-item-title>
                </v-list-item-content>
                {{ node.location.country }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> City </v-list-item-title>
                </v-list-item-content>
                {{ node.location.city }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Longitude </v-list-item-title>
                </v-list-item-content>
                {{ node.location.long }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Latitude </v-list-item-title>
                </v-list-item-content>
                {{ node.location.lat }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col :cols="colSize" :class="{ 'mt-n8': colSize === 6 }">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-silo</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Farm details </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Details -->
        <v-row>
          <v-col cols="12">
            <v-list color="transparent">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> ID </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.id }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Name </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.name }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Certification type </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.farmCertType }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Public Ips </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.pubIps }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col v-if="node.resources.gpu > 0" class="mt-n8" style="min-width: 400px">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item class="mb-n2">
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-expansion-card-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px">
              GPU Card{{ node.resources.gpu > 1 ? "s" : "" }} details
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Details -->
        <v-row v-if="!loading && nodeGPUitems != null && gpuItem">
          <v-col cols="12">
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-tooltip top nudge-bottom="30">
                    <template v-slot:activator="{ on, attrs }">
                      <v-list-item-title v-bind="attrs" v-on="on"
                        >Card ID
                        <v-chip
                          lose-icon="mdi-delete"
                          :color="gpuItem.contract ? 'warning' : 'success'"
                          x-small
                          class="mb-1 ml-3"
                          >{{ gpuItem.contract ? "Reserved" : "Available" }}</v-chip
                        >
                      </v-list-item-title>
                    </template>
                    <span>Card id that's used in a deployment</span>
                  </v-tooltip>
                </v-list-item-content>

                <v-col class="pa-0 d-flex justify-end">
                  <v-select
                    style="max-width: 270px"
                    v-if="nodeGPUitems?.length > 1"
                    append-outer-icon="mdi-content-copy"
                    hide-details
                    dense
                    v-model="gpuItem"
                    :items="nodeGPUitems"
                    @input.native="gpuItem = $event.srcElement.value.value"
                    @click:append-outer="copy(gpuItem.id)"
                  />
                  <v-text-field
                    v-else
                    :value="gpuItem?.id"
                    readonly
                    hide-details
                    class="mt-n2"
                    dense
                    append-outer-icon="mdi-content-copy"
                    @click:append-outer="copy(gpuItem.id)"
                    solo
                  />
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
              <v-list-item class="mb-0" v-if="gpuItem?.contract !== undefined">
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
            </v-list>
          </v-col></v-row
        >
        <!-- Errors and loading -->
        <v-sheet v-else class="d-flex justify-center align-center pt-0" height="230">
          <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate></v-progress-circular>
            <p class="pt-2">Loading GPU details</p>
          </div>
          <div v-else-if="nodeGPUitems === null" class="text-center">
            <v-alert class="ma-2" dense outlined type="error">
              Failed to receive node GPUs information
              <template v-slot:append>
                <v-icon class="ml-2 mt-1" @click="loadGPUitems">mdi-reload</v-icon>
              </template>
            </v-alert>
          </div>
        </v-sheet>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { getNodeGPUs, INodeGPU } from "../lib/nodes";

@Component({
  name: "NodeDetails",
})
export default class NodeDetails extends Vue {
  @Prop({ required: true }) node!: {
    nodeId: number;
    resources: { cru: string; hru: string; sru: string; mru: string; gpu: number };
    location: { country: string; city: string; long: string; lat: string };
    farm: { id: string; name: string; farmCertType: string; pubIps: string };
  };
  get colSize() {
    if (this.node.resources.gpu > 0) return 6;
    else return 4;
  }
  loading = false;
  nodeGPUitems:
    | {
        text: string;
        value: INodeGPU;
        disabled: false;
      }[]
    | null = null;
  gpuItem: INodeGPU | null = null;
  async loadGPUitems() {
    this.loading = true;
    const nodeGPU = await getNodeGPUs(this.node.nodeId);
    this.loading = false;
    if (!nodeGPU) return;
    this.nodeGPUitems = nodeGPU.map((item: INodeGPU) => {
      return {
        text: item.id,
        value: item,
        disabled: false,
      };
    });
    this.gpuItem = this.nodeGPUitems[0].value;
  }
  async mounted() {
    await this.loadGPUitems();
  }
  copy(id: string) {
    navigator.clipboard.writeText(id);
    this.$toasted.show("GPU ID copied to clipboard");
  }
}
</script>
