<template>
  <v-container>
    <div class="d-flex flex-row justify-center align-center mb-6">
      <div>
        <v-icon size="40" class="mr-2">mdi-chart-pie</v-icon>
      </div>
      <div style="font-size: 30px">
        Node Resources [<span :style="'color:' + (nodeStatus ? '#4caf50' : '#f44336')">{{
          nodeStatus ? "Online" : "Offline"
        }}</span
        >]
      </div>
    </div>
    <!-- Details -->
    <v-row v-if="!loader && resources.length">
      <v-col cols="12">
        <div v-if="loader == false" class="d-flex justify-center">
          <div v-for="item in resources" :key="item.id" class="mx-6 d-flex flex-column align-center">
            <div>{{ item.name }}</div>
            <div class="text-center">
              <!-- in case of total_resources is NaN "zero" -->
              <v-progress-circular
                :value="isNaN(item.value) ? 0 : item.value"
                :size="150"
                :width="15"
                color="primary"
                v-if="isNaN(item.value)"
                >NA
              </v-progress-circular>
              <!-- in other case-->
              <v-progress-circular
                :value="isNaN(item.value) ? 0 : item.value"
                :size="150"
                :width="15"
                color="primary"
                v-else
                >{{ item.value }}%
              </v-progress-circular>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-progress-circular v-if="loader" indeterminate color="primary" :size="50" class="mt-10 mb-10" />
    </v-row>
    <div class="d-flex justify-center mt-6" v-if="!loader && !resources.length">
      <v-alert dense type="error"> Failed to fetch node resources info. </v-alert>
    </div>
  </v-container>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { INode } from "../graphql/api";

@Component({})
export default class NodeUsedResources extends Vue {
  @Prop({ required: true }) node!: INode;
  resources: any[] = [];
  loader = false;

  get nodeStatus(): boolean {
    return this.node.status;
  }

  getNodeUsedResources() {
    this.loader = true;

    return ["cru", "sru", "hru", "mru"].map((i, idx) => {
      const value =
        this.node.capacity.total_resources[i] != 0
          ? (this.node.capacity.used_resources[i] / this.node.capacity.total_resources[i]) * 100
          : NaN; // prettier-ignore, validate if the total is zero so the usage is set to NaN else do the division
      this.loader = false;
      return {
        id: idx + 1,
        value: value.toFixed(2),
        name: i.toUpperCase(),
      };
    });
  }
  created() {
    if (this.nodeStatus) {
      const resources = this.getNodeUsedResources();
      if (resources) {
        this.resources = resources;
      }
    } else {
      this.resources = ["cru", "sru", "hru", "mru"].map((i, idx) => {
        return { id: idx + 1, value: 0, name: i.toLocaleUpperCase() };
      });
    }
  }
}
</script>
