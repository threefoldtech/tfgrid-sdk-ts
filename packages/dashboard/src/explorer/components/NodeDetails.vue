<template>
  <!-- Container for all html -->
  <v-card flat color="transparent" tag="div">
    <!-- Title -->
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-resistor-nodes</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> Node Details </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <!-- Details -->
    <v-row>
      <v-col cols="12">
        <!-- :cols="screen_max_800.matches ? 12 : screen_max_1000.matches ? 6 : 4" -->
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> ID </v-list-item-title>
            </v-list-item-content>
            {{ node.nodeId }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Farm ID </v-list-item-title>
            </v-list-item-content>
            {{ node.farmId }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Farming Policy ID </v-list-item-title>
            </v-list-item-content>
            {{ node.farmingPolicyId }}
          </v-list-item>
          <v-divider />

          <v-list-item v-if="nodeStatus">
            <v-list-item-content>
              <v-list-item-title> Uptime </v-list-item-title>
            </v-list-item-content>
            {{ node.uptime | secondToRedable }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> CPU Resource Unit </v-list-item-title>
            </v-list-item-content>
            {{ node.capacity.total_resources.cru }} CPU
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Disk Resource Unit (HDD) </v-list-item-title>
            </v-list-item-content>
            {{ node.capacity.total_resources.hru | toTeraOrGigaOrPeta }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Disk Resource Unit (SSD) </v-list-item-title>
            </v-list-item-content>
            {{ node.capacity.total_resources.sru | toTeraOrGigaOrPeta }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Memory Resource Unit </v-list-item-title>
            </v-list-item-content>
            {{ node.capacity.total_resources.mru | toTeraOrGigaOrPeta }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Created </v-list-item-title>
            </v-list-item-content>
            {{ node.created | date }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Certification Type </v-list-item-title>
            </v-list-item-content>
            {{ node.certificationType || "Not Certified" }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Number of Workloads </v-list-item-title>
            </v-list-item-content>
            {{ nodeStatistics.users.workloads }}
          </v-list-item>
          <v-divider />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> Number of Deployments </v-list-item-title>
            </v-list-item-content>
            {{ nodeStatistics.users.deployments }}
          </v-list-item>
          <v-divider />

          <v-list-item v-if="zosVersion">
            <v-list-item-content>
              <v-list-item-title> ZOS Version </v-list-item-title>
            </v-list-item-content>
            {{ zosVersion }}
          </v-list-item>

          <DatesDetails :item="node" />
        </v-list>
      </v-col>

      <!-- visuals -->
      <!-- <v-col
        :cols="screen_max_800.matches ? 12 : screen_max_1000.matches ? 6 : 4"
      >
        <v-layout
          :column="!screen_max_800.matches || screen_max_500.matches"
          :row="screen_max_800.matches"
          justify-space-around
        >
          <div>
            <p>
              CRU
            </p>
            <v-row justify="center">
              <v-progress-circular
                :rotate="360"
                :size="size"
                :width="width"
                :value="getValue('cru')"
                color="primary"
                :style="'font-size:' + fontSize + 'px'"
              >
                {{ getValue("cru") }} %
              </v-progress-circular>
            </v-row>
          </div>

          <br v-if="!screen_max_800.matches" />
          <v-divider :vertical="screen_max_800.matches" />
          <br v-if="!screen_max_800.matches || screen_max_500.matches" />

          <div>
            <p>
              MRU
            </p>
            <v-row justify="center">
              <v-progress-circular
                :rotate="360"
                :size="size"
                :width="width"
                :value="getValue('mru')"
                color="primary"
                :style="'font-size:' + fontSize + 'px'"
              >
                {{ getValue("mru") }} %
              </v-progress-circular>
            </v-row>
          </div>
        </v-layout>
      </v-col>

      <v-col cols="12" v-if="screen_max_800.matches && !screen_max_500.matches">
        <br />
        <v-divider />
        <br />
      </v-col>

      <v-col :cols="screen_max_1000.matches ? 12 : 4">
        <br v-if="screen_max_500.matches" />

        <v-layout
          :column="!screen_max_1000.matches || screen_max_500.matches"
          :row="screen_max_1000.matches"
          justify-space-around
        >
          <div>
            <p>
              HRU
            </p>
            <v-row justify="center">
              <v-progress-circular
                :rotate="360"
                :size="size"
                :width="width"
                :value="getValue('hru')"
                color="primary"
                :style="'font-size:' + fontSize + 'px'"
              >
                {{ getValue("hru") }} %
              </v-progress-circular>
            </v-row>
          </div>

          <br v-if="!screen_max_1000.matches" />
          <v-divider :vertical="screen_max_1000.matches" />
          <br v-if="!screen_max_1000.matches || screen_max_500.matches" />

          <div>
            <p>
              SRU
            </p>
            <v-row justify="center">
              <v-progress-circular
                :rotate="360"
                :size="size"
                :width="width"
                :value="getValue('sru')"
                color="primary"
                :style="'font-size:' + fontSize + 'px'"
              >
                {{ getValue("sru") }} %
              </v-progress-circular>
            </v-row>
          </div>
        </v-layout>
      </v-col> -->
    </v-row>
  </v-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { INode, INodeStatistics } from "../graphql/api";
import DatesDetails from "./DatesDetails.vue";
import mediaMatcher from "../utils/mediaMatcher";
import isNodeOnline from "../utils/isNodeOnline";

function createItem(value: string, key?: keyof INode) {
  key = key ? key : (value.toLocaleLowerCase() as any);
  return { value, key } as { value: string; key: keyof INode };
}

@Component({
  components: {
    DatesDetails,
  },
})
export default class NodeDetails_ extends Vue {
  @Prop({ required: true }) node!: INode;
  @Prop({ required: true }) nodeStatistics!: INodeStatistics;
  size = 210;
  width = 10;
  fontSize = 25;
  zosVersion = "";

  // used for animation
  initLoading = true;

  items = [
    createItem("ID"),
    createItem("Uptime"),
    createItem("HRU"),
    createItem("SRU"),
    createItem("CRU"),
    createItem("MRU"),
  ];

  getValue(key: keyof INode): number {
    if (this.initLoading) {
      requestAnimationFrame(() => {
        this.initLoading = false;
      });
      return 0;
    }
    const v = this.node[key];
    const value = v ? +v / this.$store.getters["explorer/maxValueOf"]("nodes", key) : 0;

    return Math.round(value * 10000) / 100;
  }

  get nodeStatus(): boolean {
    return isNodeOnline(this.node);
  }

  getZOSVersion(nodeId: number) {
    return fetch(`${window.configs.APP_GRIDPROXY_URL}/nodes/${nodeId}`)
      .then(res => res.json())
      .then<string>(res => {
        if ("Error" in res) return;
        return res.zosVersion;
      })
      .catch(() => {
        /* Pass */
      });
  }
  created() {
    if (isNodeOnline(this.node)) {
      this.getZOSVersion(this.node.nodeId).then(zosVersion => {
        if (zosVersion) this.zosVersion = zosVersion;
      });
    }
  }

  screen_max_1000 = mediaMatcher("(max-width: 1000px)");
  screen_max_800 = mediaMatcher("(max-width: 800px)");
  screen_max_500 = mediaMatcher("(max-width: 500px)");

  destroyed() {
    this.screen_max_1000.destry();
    this.screen_max_800.destry();
    this.screen_max_500.destry();
  }
}
</script>
