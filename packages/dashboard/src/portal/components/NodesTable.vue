<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="nodes"
      :single-expand="true"
      :expanded.sync="expanded"
      show-expand
      :disable-sort="true"
      item-key="nodeId"
      class="elevation-1"
      :loading="loading"
      loading-text="loading nodes ..."
      :server-items-length="count"
      :items-per-page="pageSize"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, 50],
      }"
      @update:options="onUpdateOptions($event.page, $event.itemsPerPage)"
      @item-expanded="getDNodeDetails"
    >
      <template v-slot:[`item.resources.mru`]="{ item }">
        {{ byteToGB(item.resources.mru) }}
      </template>
      <template v-slot:[`item.resources.sru`]="{ item }">
        {{ byteToGB(item.resources.sru) }}
      </template>
      <template v-slot:[`item.resources.hru`]="{ item }">
        {{ byteToGB(item.resources.hru) }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <NodeActionBtn :nodeId="item.nodeId" :status="item.rentStatus" @node-status-changed="onStatusUpdate()" />
      </template>
      <template v-slot:[`item.discount`]="{ item }">
        <v-tooltip bottom color="primary" close-delay="1000">
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">{{ item.discount }} *</span>
          </template>
          <span
            >Discounts: <br />
            <ul>
              <li>
                You receive {{ item.applyedDiscount.first }}% discount if you reserve an entire
                <a
                  target="_blank"
                  href="https://library.threefold.me/info/threefold#/cloud/threefold__pricing?id=dedicated-servers"
                  style="color: blue"
                  >node</a
                >
              </li>
              <li>
                You're receiving {{ item.applyedDiscount.second }}% discount as per the
                <a
                  target="_blank"
                  href="https://library.threefold.me/info/threefold/#/tfgrid/grid/pricing?id=discount-levels"
                >
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
          <NodeDetails :node="item" :byteToGB="byteToGB" />
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import NodeActionBtn from "../components/NodeActionBtn.vue";
import NodeDetails from "../components/NodeDetails.vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getDNodes, ITab, getFarmDetails } from "../lib/nodes";
import { byteToGB } from "../lib/nodes";

@Component({
  name: "NodesTable",
  components: { NodeActionBtn, NodeDetails },
})
export default class NodesTable extends Vue {
  @Prop({ required: true }) tab!: ITab;
  @Prop({ required: true }) twinId: any;
  @Prop({ required: true }) trigger!: string;
  $api: any;
  expanded: any = [];
  loading = true;
  dNodeLoading = true;
  dNodeError = false;
  address = "";

  nodes: any[] = [];
  count = 0;
  pageNumber = 1;
  pageSize = 10;

  headers = [
    { text: "Node ID", value: "nodeId", align: "center" },
    { text: "Location", value: "location.country", align: "center" },
    { text: "CRU", value: "resources.cru", align: "center" },
    { text: "HRU (GB)", value: "resources.hru", align: "center" },
    { text: "MRU (GB)", value: "resources.mru", align: "center" },
    { text: "SRU (GB)", value: "resources.sru", align: "center" },
    { text: "Price (USD)", value: "discount", align: "center" },
    { text: "Actions", value: "actions", align: "center", sortable: false },
  ];

  @Watch("$route.params.accountID") async onPropertyChanged(value: string, oldValue: string) {
    console.log(`removing nodes of ${oldValue}, putting in nodes of ${value}`);
    await this.getNodes();
  }

  @Watch("trigger", { immediate: true }) onTab() {
    this.getNodes();
  }

  async mounted() {
    this.address = this.$route.params.accountID;
  }

  async onUpdateOptions(pageNumber: number, pageSize: number) {
    if (this.pageNumber === pageNumber && this.pageSize === pageSize) return;

    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    await this.getNodes();
  }

  async getDNodeDetails(event: any) {
    // value is whether or not the row is expanded now.
    if (!event.value) return;
    try {
      this.dNodeError = false;
      this.dNodeLoading = true;
      let res = await getFarmDetails(event.item.farm.id);
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
    this.loading = true;
    this.$toasted.show(`Table may take some time to update the changes.`);
    setTimeout(async () => {
      await this.getNodes();
    }, 5000);
  }

  async getNodes() {
    this.nodes = [];
    this.loading = true;

    let { dNodes, count } = await getDNodes(
      this.$api,
      this.address,
      this.twinId,
      this.tab.query,
      this.pageNumber,
      this.pageSize,
    );

    this.nodes = dNodes;
    this.count = parseInt(count as string);
    this.loading = false;
  }

  byteToGB(capacity: number) {
    return byteToGB(capacity);
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
</style>
