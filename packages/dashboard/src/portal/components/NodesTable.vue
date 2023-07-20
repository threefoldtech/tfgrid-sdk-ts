<template>
  <v-container>
    <v-responsive class="responsive-table">
      <v-data-table
        :headers="headers"
        :items="$store.getters['portal/getDedicatedNodes']"
        :server-items-length="$store.getters['portal/getDedicatedNodesCount']"
        :single-expand="true"
        :expanded.sync="expanded"
        show-expand
        :disable-sort="true"
        item-key="nodeId"
        class="elevation-1"
        :loading="$store.getters['portal/getTableLoad']"
        :page.sync="page"
        loading-text="loading dedicated nodes ..."
        :items-per-page="pageSize"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 50],
        }"
        @update:options="onUpdateOptions($event.page, $event.itemsPerPage)"
        @item-expanded="getDNodeDetails"
      >
        <template v-slot:[`item.mru`]="{ item }">
          {{ convert(item.mru) }}
        </template>
        <template v-slot:[`item.sru`]="{ item }">
          {{ convert(item.sru) }}
        </template>
        <template v-slot:[`item.hru`]="{ item }">
          {{ convert(item.hru) }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <NodeActionBtn :nodeId="item.nodeId" :status="item.rentStatus" @node-status-changed="onStatusUpdate()" />
        </template>
        <template v-slot:[`item.discount`]="{ item }">
          <v-tooltip bottom color="primary" close-delay="1000">
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">{{ item.discount + (item.extraFee ? item.extraFee / 1000 : 0) }} *</span>
            </template>
            <span
              >Discounts: <br />
              <ul>
                <li>
                  You receive {{ item.applyedDiscount.first }}% discount if you reserve an entire
                  <a
                    target="_blank"
                    href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html#billing--pricing"
                    style="color: blue"
                    >node</a
                  >
                </li>
                <li>
                  You're receiving {{ item.applyedDiscount.second }}% discount as per the
                  <a target="_blank" href="https://manual.grid.tf/cloud/cloudunits_pricing.html#discount-levels">
                    <p style="color: blue; display: inline">discount levels</p>
                  </a>
                </li>
              </ul>
            </span>
          </v-tooltip>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length" v-if="dNodeLoading" style="text-align: center">
            <div class="pa-1">
              <v-progress-circular indeterminate model-value="20" :width="3"></v-progress-circular>
            </div>
          </td>
          <td :colspan="headers.length" v-else-if="dNodeError" style="text-align: center">
            <strong style="color: #f44336">Failed to retrieve Node details</strong>
          </td>
          <td :colspan="headers.length" v-else>
            <NodeDetails :node="item" />
          </td>
        </template>
      </v-data-table>
    </v-responsive>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import toTeraOrGigaOrPeta from "../../explorer/filters/toTeraOrGigaOrPeta";
import NodeActionBtn from "../components/NodeActionBtn.vue";
import NodeDetails from "../components/NodeDetails.vue";
import { getFarmDetails, ITab } from "../lib/nodes";
import { ActionTypes } from "../store/actions";
import { MutationTypes } from "../store/mutations";

@Component({
  name: "NodesTable",
  components: { NodeActionBtn, NodeDetails },
})
export default class NodesTable extends Vue {
  @Prop({ required: true }) tab!: ITab;
  @Prop({ required: true }) twinId: any;
  @Prop({ required: true }) trigger!: string;
  @Prop({ required: true }) filterKeys!: string;

  $api: any;
  expanded: any = [];
  dNodeLoading = true;
  dNodeError = false;
  address = "";

  pageNumber = 1;
  pageSize = 10;

  headers = [
    { text: "Node ID", value: "nodeId", align: "center" },
    { text: "Location", value: "location.country", align: "center" },
    { text: "CRU", value: "resources.cru", align: "center" },
    { text: "MRU", value: "resources.mru", align: "center" },
    { text: "SRU", value: "resources.sru", align: "center" },
    { text: "HRU", value: "resources.hru", align: "center" },
    { text: "GPU", value: "resources.gpu", align: "center" },
    { text: "Price (USD)", value: "discount", align: "center" },
    { text: "Actions", value: "actions", align: "center", sortable: false },
  ];

  @Watch("$route.params.accountID") async onPropertyChanged(value: string, oldValue: string) {
    console.log(`removing nodes of ${oldValue}, putting in nodes of ${value}`);
    this.requestNodes();
  }

  @Watch("trigger", { immediate: true }) onTab() {
    this.requestNodes();
    this.expanded = this.expanded.length ? [] : this.expanded;
  }

  @Watch("filterKeys") async filterRequest() {
    this.requestNodes();
    this.expanded = this.expanded.length ? [] : this.expanded;
  }

  async mounted() {
    this.address = this.$store.state.credentials.account.address;
    this.$store.commit("portal/" + MutationTypes.SET_ADDRESS, this.address);
  }

  async onUpdateOptions(pageNumber: number, pageSize: number) {
    if (this.pageNumber === pageNumber && this.pageSize === pageSize) return;
    this.$store.commit("portal/" + MutationTypes.SET_DEDICATED_NODES_TABLE_PAGE_NUMBER, pageNumber);
    this.$store.commit("portal/" + MutationTypes.SET_DEDICATED_NODES_TABLE_PAGE_SIZE, pageSize);
    this.requestNodes();
  }

  async getDNodeDetails(event: any) {
    // value is whether or not the row is expanded now.
    if (!event.value) return;
    try {
      this.dNodeError = false;
      this.dNodeLoading = true;
      const res = await getFarmDetails(event.item.farm.id);
      if (Array.isArray(res) && !res.length) throw new Error("Can't resolve farm data");
      event.item.farm.name = res[0].name;
      event.item.farm.farmCertType = res[0].certificationType;
      event.item.farm.pubIps = res[0].publicIps.length;
    } catch (e) {
      this.dNodeError = true;
    }
    this.dNodeLoading = false;
  }

  async onStatusUpdate() {
    this.$toasted.show(`Table may take some time to update the changes.`);
    setTimeout(async () => {
      this.requestNodes();
    }, 5000);
  }

  // reload the nodes table
  async requestNodes() {
    if (this.$api) {
      this.$store.commit(`portal/${MutationTypes.SET_API}`, this.$api);
      this.$store.commit(`portal/${MutationTypes.SET_TWIN_ID}`, this.twinId);
      this.$store.commit(`portal/${MutationTypes.SET_TAB_QUERY}`, this.tab.query);
      await this.$store.dispatch(`portal/${ActionTypes.REQUEST_DEDICATED_NODES}`);
    }
  }

  get page() {
    return this.$store.getters["portal/getDedicatedNodesTablePageNumber"];
  }

  set page(value) {
    this.$store.commit("portal/" + MutationTypes.SET_DEDICATED_NODES_TABLE_PAGE_NUMBER, value);
  }

  convert(capacity: number) {
    return toTeraOrGigaOrPeta(capacity.toString());
  }
}
</script>

<style>
.v-data-table-header th {
  white-space: nowrap;
}
</style>

<style scoped>
.v-tooltip__content {
  pointer-events: initial;
}
.responsive-table {
  width: 100%;
  height: 100%;
}
</style>
