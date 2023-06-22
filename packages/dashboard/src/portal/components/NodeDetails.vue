<template>
  <v-row>
    <v-col :cols="3">
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
                {{ node.resources.hru | toTeraOrGigaOrPeta }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Disk (SSD) </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.sru | toTeraOrGigaOrPeta }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Memory </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.mru | toTeraOrGigaOrPeta }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col :cols="3">
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
    <v-col :cols="3">
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

    <v-col :cols="3" class="my-4">
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
        <v-sheet class="d-flex justify-center align-center" height="180">
          <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate></v-progress-circular>
            <p class="pt-2">Loading GPU details</p>
          </div>
          <div v-else-if="nodeGPU === undefined" class="text-center">
            <v-alert class="ma-2" dense outlined type="error">
              Failed to receive node GPUs information
              <template v-slot:append>
                <v-icon @click="loadGPUitems">mdi-reload</v-icon>
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
  loading = false;
  nodeGPU: INodeGPU[] | undefined = [];
  gpuError = false;
  async loadGPUitems() {
    this.loading = true;
    this.nodeGPU = await getNodeGPUs(this.node.nodeId);
    console.log(this.nodeGPU);
    this.loading = false;
  }
  async mounted() {
    await this.loadGPUitems();
  }
}
</script>
