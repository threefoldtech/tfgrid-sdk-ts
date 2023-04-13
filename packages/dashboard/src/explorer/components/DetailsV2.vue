<template>
  <v-bottom-sheet v-model="open" persistent no-click-animation @click:outside="$emit('close-sheet')">
    <v-sheet class="text-center" height="90vh">
      <div class="content" v-if="!loading">
        <v-row>
          <v-col v-if="node">
            <NodeUsedResources :node="node" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4" v-if="node">
            <NodeDetails :node="node" :nodeStatistics="nodeStatistics" />
          </v-col>

          <v-col :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4" v-if="data.farm">
            <FarmDetails :farm="data.farm" />
          </v-col>

          <v-col
            :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4"
            v-if="node && node.country && node.location"
          >
            <LocationDetails :country="node.country" :location="node.location" />
          </v-col>

          <v-col :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4" v-if="nodePublicConfig()">
            <PublicConfigDetails :config="node.publicConfig" />
          </v-col>

          <v-col :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4" v-if="country">
            <CountryDetails :country="node.country" :city="node.city" :location="node.location" :code="country.code" />
          </v-col>

          <v-col :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4" v-if="data.twin">
            <TwinDetails :twin="data.twin" :title="node ? 'Node Twin Details' : 'Farm Twin Details'" />
          </v-col>

          <v-col :cols="screen_max_700.matches ? 12 : screen_max_1200.matches ? 6 : 4" v-if="node && node.interfaces">
            <InterfacesDetails :interfaces="node.interfaces" />
          </v-col>
        </v-row>
      </div>
      <div v-if="loading" class="pt-10">
        <v-progress-circular indeterminate color="primary" :size="100" />
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import CountryDetails from "./CountryDetails.vue";
import NodeDetails from "./NodeDetails.vue";
import FarmDetails from "./FarmDetails.vue";
import LocationDetails from "./LocationDetails.vue";
import TwinDetails from "./TwinDetails.vue";
import PublicConfigDetails from "./PublicConfigDetails.vue";
import InterfacesDetails from "./InterfacesDetails.vue";
import NodeUsedResources from "./NodeUsedResources.vue";
import mediaMatcher from "../utils/mediaMatcher";
import { DocumentNode } from "graphql";
import { ICountry, INode, INodeStatistics } from "../graphql/api";

@Component({
  components: {
    CountryDetails,
    NodeDetails,
    FarmDetails,
    LocationDetails,
    TwinDetails,
    PublicConfigDetails,
    InterfacesDetails,
    NodeUsedResources,
  },
})
export default class Details extends Vue {
  @Prop({ required: true }) open!: boolean;
  @Prop({ required: true }) query!: DocumentNode;
  @Prop({ required: true }) variables!: { [key: string]: any };
  @Prop() nodeId: any;

  loading = false;

  data: any = {};

  get node(): INode {
    return this.data.node;
  }

  get nodeStatistics(): INodeStatistics {
    return this.data.nodeStatistics;
  }

  get country(): ICountry {
    return this.data.country;
  }

  screen_max_1200 = mediaMatcher("(max-width: 1200px)");
  screen_max_700 = mediaMatcher("(max-width: 700px)");

  @Watch("open", { immediate: true })
  onOpenChange() {
    if (!this.open) return;

    this.loading = true;
    const { query, variables } = this;
    this.$apollo
      .query({ query, variables })
      .then(async ({ data }) => {
        this.data = Object.keys(data).reduce((res, key) => {
          res[key] = res[key][0];
          return res;
        }, data);

        // update with the data from grid proxy
        if (this.nodeId) {
          this.data.node = await fetch(`${window.configs.APP_GRIDPROXY_URL}/nodes/${this.nodeId}`).then(res =>
            res.json(),
          );
          this.data.nodeStatistics = await fetch(
            `${window.configs.APP_GRIDPROXY_URL}/nodes/${this.nodeId}/statistics`,
          ).then(res => res.json());
          this.data.node.status = this.data.node.status === "up";
        }
      })
      .catch(() => {
        /* pass */
      })
      .finally(() => {
        this.loading = false;
      });
  }

  destroyed() {
    this.screen_max_1200.destry();
    this.screen_max_700.destry();
  }

  nodePublicConfig() {
    return this.node &&
      this.node.publicConfig &&
      this.node.publicConfig?.domain.length > 0 &&
      this.node.publicConfig?.gw4.length > 0 &&
      this.node.publicConfig?.gw6.length > 0 &&
      this.node.publicConfig?.ipv4.length > 0 &&
      this.node.publicConfig?.ipv6.length > 0
      ? true
      : false;
  }
}
</script>
<style lang="scss" scoped>
.content {
  text-align: left;
  overflow-x: hidden;
  overflow-y: auto;
  will-change: transform;
  height: 100%;
  padding: 20px;
}
</style>
