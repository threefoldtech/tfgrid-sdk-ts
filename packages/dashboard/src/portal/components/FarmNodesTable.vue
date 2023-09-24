<template>
  <div>
    <div style="padding-top: 20px"></div>

    <!-- Show only if you have nodes -->
    <div v-if="nodes.length">
      <!-- Searching/Sorting is disabled for now -->
      <!-- <v-text-field
        v-model="searchTerm"
        color="primary darken-2"
        label="Search by node ID, serial number, certification, farming policy ID"
      ></v-text-field> -->

      <v-data-table
        :headers="headers"
        :items="nodes"
        :single-expand="true"
        :expanded.sync="expanded"
        :loading="loadingNodes"
        show-expand
        :disable-sort="true"
        item-key="id"
        class="elevation-1"
        sort-by="id"
        :server-items-length="+count"
        @update:options="onOptionChange($event.page, $event.itemsPerPage)"
      >
        <template v-slot:top>
          <v-toolbar flat class="primary white--text">
            <v-toolbar-title>Your Farm Nodes</v-toolbar-title>
          </v-toolbar>
        </template>

        <template v-slot:[`item.nodeId`]="{ item }">
          <p class="text-center mt-1 mb-0">
            {{ item.nodeId }}
          </p>
        </template>
        <template v-slot:[`item.serialNumber`]="{ item }">
          <p class="text-center mt-1 mb-0">
            {{ item.serialNumber }}
            <v-tooltip right v-if="item.serialNumber === `Default string`">
              <template v-slot:activator="{ on, attrs }">
                <v-icon medium v-on="on" v-bind="attrs"> mdi-information </v-icon>
              </template>
              <span>The manufacturer didn't provide a proper serial number</span>
            </v-tooltip>
          </p>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <p class="text-center mt-1 mb-0">
            <v-chip :color="getStatus(item).color">{{ getStatus(item).status }}</v-chip>
          </p>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-progress-circular v-if="loadingDelete" indeterminate color="primary"></v-progress-circular>
          <!--delete node-->
          <!--removed until fixed -->
          <!--config Ips-->
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="configIcon" medium v-on="on" v-bind="attrs" @click="openPublicConfig(item)">
                mdi-earth
              </v-icon>
            </template>
            <span>Add a public config</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="configIcon ml-2" medium v-on="on" v-bind="attrs" @click="openExtraFee(item)">
                mdi-code-string
              </v-icon>
            </template>
            <span>Set Additional Fees</span>
          </v-tooltip>
        </template>

        <!--expanded node view-->
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length" key="item.id">
            <v-container>
              <v-card outlined>
                <v-card-title>
                  <span class="headline">Node Details</span>
                </v-card-title>
                <v-card-text>
                  <v-row :justify="'space-around'">
                    <v-col cols="8">
                      <v-container class="mx-10 mt-5">
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Node ID</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.nodeId }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Farm ID</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.farmId }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Twin ID</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.twinId }}</span>
                          </v-flex>
                        </v-row>

                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Certification </v-flex>

                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.certificationType }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">First boot at</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ new Date(parseInt(item.created) * 1000) }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Updated at</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ new Date(parseInt(item.updatedAt) * 1000) }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Country</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.country }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">City</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.city }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Serial Number</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.serialNumber }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <v-flex xs3 class="text-left pr-2">Farming Policy ID</v-flex>
                          <v-flex class="text-truncate font-weight-bold">
                            <span>{{ item.farmingPolicyId }}</span>
                          </v-flex>
                        </v-row>
                        <v-row>
                          <span>For more information visit the Capacity Explorer</span>
                        </v-row>
                      </v-container>
                    </v-col>
                    <v-col cols="4" class="text-center" :align-self="'center'">
                      <v-flex class="text-truncate font-weight-bold">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <v-progress-circular
                              v-on="on"
                              :rotate="-90"
                              :size="150"
                              :width="20"
                              :value="getNodeUptimePercentage(item)"
                              color="light-green darken-2"
                            />

                            <span> Uptime: {{ getNodeUptimePercentage(item) }} % </span>
                          </template>
                          <span>Current Node Uptime Percentage (since start of the current minting period)</span>
                        </v-tooltip>
                      </v-flex>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-container>

            <v-col>
              <v-expansion-panels v-model="resourcesPanel" :disabled="false" focusable>
                <v-expansion-panel>
                  <v-expansion-panel-header> Resource units reserved </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row class="mt-5 mb-5">
                      <v-col v-for="(value, key) in item.total_resources" :key="key" align="center">
                        <v-flex class="text-center pr-2">
                          <span class="text-uppercase">{{ key }}</span>
                        </v-flex>
                        <v-flex class="text-truncate font-weight-bold">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                              <v-progress-circular
                                v-on="on"
                                :rotate="-90"
                                :size="150"
                                :width="20"
                                :value="isNaN(getPercentage(key)) ? 0 : getPercentage(key)"
                                color="light-green darken-2"
                              />
                              <template v-if="item.used_resources">
                                <span v-if="item.total_resources[key] > 1000">
                                  {{ byteToGB(item.used_resources[key]) }} /
                                  {{ byteToGB(item.total_resources[key]) }} GB
                                </span>

                                <span v-else-if="item.total_resources[key] == 0"> NA </span>
                                <span v-else>
                                  {{ item.used_resources[key] }} /
                                  {{ item.total_resources[key] }}
                                </span>
                              </template>
                            </template>
                          </v-tooltip>
                        </v-flex>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
            <v-col v-if="network == 'main'">
              <v-expansion-panels v-model="receiptsPanel" :disabled="false" focusable single>
                <v-expansion-panel>
                  <v-expansion-panel-header> Node Statistics </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <NodeMintingDetails :node="item" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </td>
        </template>
      </v-data-table>

      <!--public config dialog-->
      <v-dialog v-model="openPublicConfigDialog" width="800">
        <v-card>
          <v-card-title class="text-h5">
            Add a public config to your node with ID: {{ nodeToEdit.nodeId }}
          </v-card-title>

          <v-card-text class="text">
            <v-form v-model="isValidPublicConfig">
              <v-text-field
                label="IPV4"
                v-model="ip4"
                required
                outlined
                dense
                type="string"
                hint="IPV4 address in CIDR format xx.xx.xx.xx/xx"
                persistent-hint
                :error-messages="ip4ErrorMessage"
                :rules="[() => !!ip4 || 'This field is required', ip4check]"
              ></v-text-field>

              <v-text-field
                label="Gateway"
                v-model="gw4"
                required
                outlined
                dense
                ref="gw4Ref"
                hint="Gateway for the IP in ipv4 format"
                persistent-hint
                type="string"
                :error-messages="gw4ErrorMessage"
                :rules="[() => !!gw4 || 'This field is required', gw4Check]"
              ></v-text-field>

              <v-divider></v-divider>

              <v-text-field
                label="IPV6"
                v-model="ip6"
                type="string"
                outlined
                dense
                hint="IPV6 address in format x:x:x:x:x:x:x:x"
                persistent-hint
                ref="ip6Ref"
                @input="gw6Validate"
                :error-messages="ip6ErrorMessage"
                :rules="[ip6check]"
              ></v-text-field>

              <v-text-field
                label="Gateway IPV6"
                v-model="gw6"
                outlined
                dense
                type="string"
                hint="Gateway for the IP in ipv6 format "
                persistent-hint
                ref="gw6Ref"
                @input="ip6Validate"
                :error-messages="gw6ErrorMessage"
                :rules="[gw6Check]"
              ></v-text-field>

              <v-text-field
                label="Domain"
                v-model="domain"
                outlined
                dense
                type="string"
                hint="Domain for webgateway"
                persistent-hint
                :error-messages="domainErrorMessage"
                :rules="[domainCheck]"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn text color="error" @click="openRemoveConfigWarningDialog = true" :disabled="!hasPublicConfig">
              Remove config
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-2 black--text" @click="openPublicConfigDialog = false"> Cancel </v-btn>
            <v-btn
              color="primary white--text"
              @click="openWarningDialog = true"
              :disabled="!isValidPublicConfig || !changed"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--extra fees dialog-->
      <v-dialog v-model="openExtraFeeDialogue" width="800">
        <v-card>
          <v-card-title class="text-h5">Set Additional Fees</v-card-title>
          <v-card-subtitle class="my-0" style="font-size: 1rem">
            Additional fees will be added to your node {{ nodeToEdit.nodeId }} (for the special hardware you’re
            providing e.g. GPUs) while renting.
          </v-card-subtitle>
          <v-card-text class="text">
            <v-form v-model="isValidExtraFee" style="position: relative">
              <v-text-field
                class="mt-4"
                label="Additional Fees"
                v-model="extraFee"
                required
                outlined
                dense
                type="number"
                :error-messages="extraFeeErrorMessage"
                :rules="[
                  () => !!extraFee || 'This field is required',
                  () => extraFee > 0 || 'Extra fee cannot be negative or 0',
                ]"
              >
              </v-text-field>
              <span style="position: absolute; right: 2%; top: 15%; color: grey">USD/Month</span>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="justify-end py-4">
            <v-btn color="grey lighten-2 black--text" @click="openExtraFeeDialogue = false"> Cancel </v-btn>
            <v-btn
              color="primary white--text"
              @click="saveExtraFee(extraFee)"
              :loading="loadingExtraFee"
              :disabled="!isValidExtraFee"
            >
              Set
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- delete item dialog-->
      <v-dialog v-model="openDeleteDialog" max-width="700px">
        <v-card>
          <v-card-title class="text-h5">Are you certain you want to delete this node from your farm?</v-card-title>
          <v-card-text>This will delete the node on chain, this action is irreversible</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-2 black--text" @click="openDeleteDialog = false">Cancel</v-btn>
            <v-btn color="primary white--text" @click="deleteItem()">OK</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openWarningDialog" max-width="700">
        <v-card>
          <v-card-title class="text-h5">Are you certain you want to update this node's public config?</v-card-title>
          <v-card-text> This action is irreversible</v-card-text>
          <v-card-actions>
            <v-btn @click="saveConfig()" :loading="loadingPublicConfig">Submit</v-btn>
            <v-btn @click="openWarningDialog = false" :disabled="loadingPublicConfig">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openRemoveConfigWarningDialog" max-width="700">
        <v-card>
          <v-card-title class="text-h5">Are you certain you want to remove this node's public config?</v-card-title>
          <v-card-text> This action is irreversible</v-card-text>
          <v-card-actions>
            <v-btn @click="removeConfig()" :loading="loadingPublicConfig">Submit</v-btn>
            <v-btn @click="openRemoveConfigWarningDialog = false" :disabled="loadingPublicConfig">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="initLoading">
      <v-data-table loading loading-text="loading nodes.." :headers="headers">
        <template v-slot:top>
          <v-toolbar flat class="primary white--text">
            <v-toolbar-title>Your Farm Nodes</v-toolbar-title>
          </v-toolbar>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script lang="ts">
import { QueryClient } from "@threefold/tfchain_client";
import { Decimal } from "decimal.js";
import ipaddr, { IPv4, IPv6 } from "ipaddr.js";
import jsPDF from "jspdf";
import { default as PrivateIp } from "private-ip";
import { Component, Prop, Vue } from "vue-property-decorator";

import config from "@/portal/config";
import { addNodePublicConfig, deleteNode, nodeInterface } from "@/portal/lib/farms";
import { byteToGB, generateNodeSummary, generateReceipt, getNodeUptimePercentage } from "@/portal/lib/nodes";
import { hex2a } from "@/portal/lib/util";

import { setDedicatedNodeExtraFee } from "../lib/nodes";
import NodeMintingDetails from "./NodeMintingDetails.vue";
@Component({
  name: "FarmNodesTable",
  components: { NodeMintingDetails },
})
export default class FarmNodesTable extends Vue {
  queryClient = new QueryClient(window.configs.APP_API_URL);
  expanded: any = [];
  receiptsPanel = [];
  resourcesPanel = [];
  network = config.network;
  validator = require("validator");

  headers = [
    { text: "Node ID", value: "nodeId", align: "center" },
    { text: "Farm ID", value: "farmId", align: "center" },
    { text: "Country", value: "country", align: "center" },
    { text: "Serial Number", value: "serialNumber", align: "center" },
    { text: "Status", value: "status", align: "center" },
    { text: "Actions", value: "actions", sortable: false, align: "center" },
  ];

  loadingDelete = false;
  openDeleteDialog = false;
  editedIndex = -1;
  editedItem: any;
  nodeToEdit: nodeInterface = {
    id: "",
    nodeId: 0,
    farmId: 0,
    twinId: 0,
    country: "",
    gridVersion: 0,
    city: "",
    uptime: 0,
    created: 0,
    farmingPolicyId: 0,
    updatedAt: 0,
    total_resources: {
      cru: 0,
      sru: 0,
      hru: 0,
      mru: 0,
    },
    used_resources: {
      cru: 0,
      sru: 0,
      hru: 0,
      mru: 0,
    },
    location: {
      country: "",
      city: "",
    },

    publicConfig: {
      domain: "",
      gw4: "",
      gw6: "",
      ipv4: "",
      ipv6: "",
    },
    status: "",
    certificationType: "",
    dedicated: true,
    extraFee: 0,
    rentContractId: 0,
    rentedByTwinId: 0,
    receipts: [],
    serialNumber: "",
    availability: { downtime: 0, currentPeriod: 0 },
  };
  nodeToDelete: { id: string } = {
    id: "",
  };
  openPublicConfigDialog = false;
  openExtraFeeDialogue = false;
  @Prop({ required: true }) nodes!: nodeInterface[];
  @Prop({ required: true }) loadingNodes!: boolean;
  @Prop({ required: true }) initLoading!: boolean;
  @Prop({ required: true }) count!: string;
  extraFee = 0;
  searchTerm = "";
  ip4 = "";
  gw4 = "";
  ip6 = "";
  gw6 = "";
  domain = "";
  loadingPublicConfig = false;
  loadingExtraFee = false;
  $api: any;
  isValidPublicConfig = false;
  changed = false;
  hasPublicConfig = false;
  isValidExtraFee = false;
  openWarningDialog = false;
  openRemoveConfigWarningDialog = false;
  ip4ErrorMessage = "";
  gw4ErrorMessage = "";
  ip6ErrorMessage = "";
  gw6ErrorMessage = "";
  domainErrorMessage = "";
  extraFeeErrorMessage = "";
  receipts = [];
  form = {
    domain: "",
    gw6: "",
    ip6: "",
    gw4: "",
    ip4: "",
  };

  updated() {
    this.receiptsPanel = [];
    this.form = {
      domain: this.domain,
      gw6: this.gw6,
      ip6: this.ip6,
      gw4: this.gw4,
      ip4: this.ip4,
    };
    if (
      this.form.domain != this.nodeToEdit.publicConfig.domain ||
      this.form.gw4 != this.nodeToEdit.publicConfig.gw4 ||
      this.form.gw6 != this.nodeToEdit.publicConfig.gw6 ||
      this.form.ip4 != this.nodeToEdit.publicConfig.ipv4 ||
      this.form.ip6 != this.nodeToEdit.publicConfig.ipv6
    ) {
      this.changed = true;
    } else {
      this.changed = false;
    }
  }
  onOptionChange(pageNumber: number, pageSize: number) {
    this.$emit("options-changed", { pageNumber, pageSize });
  }

  // filteredNodes() {
  //   let nodes = this.nodes;
  //   if (this.nodes.length > 0) {
  //     nodes = this.nodes.filter(
  //       (node: nodeInterface) =>
  //         `${node.nodeId}`.includes(this.searchTerm) ||
  //         node.serialNumber
  //           ?.toLowerCase()
  //           .includes(this.searchTerm.toLowerCase()) ||
  //         node.certificationType
  //           ?.toLowerCase()
  //           .includes(this.searchTerm.toLowerCase()) ||
  //         `${node.farmingPolicyId}`.includes(this.searchTerm)
  //     );
  //   }
  //   return nodes.map((node) => {
  //     return { ...node };
  //   });
  // }

  downloadAllReceipts() {
    const docSum = new jsPDF();
    generateNodeSummary(docSum, this.nodes);
    docSum.addPage();

    this.nodes.map((node, i) => {
      generateReceipt(docSum, node);
      docSum.text(`${i + 1}`, 185, docSum.internal.pageSize.height - 10);
      docSum.addPage();
    });
    docSum.save("nodes_receipts.pdf");
  }
  convertHex(node: { id: string }) {
    return hex2a(node.id);
  }
  byteToGB(capacity: number) {
    return byteToGB(capacity);
  }
  saveConfig() {
    const config: {
      ip4: { ip: string; gw: string };
      ip6?: { ip: string; gw: string };
      domain?: string;
    } = {
      ip4: {
        ip: this.ip4,
        gw: this.gw4,
      },
    };
    if (this.ip6 != "" && this.gw6 != "")
      config.ip6 = {
        ip: this.ip6,
        gw: this.gw6,
      };

    if (this.domain != "") config.domain = this.domain;

    this.save(config);
  }
  save(
    config: {
      ip4: { ip: string; gw: string };
      ip6?: { ip: string | undefined; gw: string | undefined };
      domain?: string;
    } | null,
  ) {
    this.loadingPublicConfig = true;
    addNodePublicConfig(
      this.$store.state.credentials.account.address,
      this.$api,
      this.nodeToEdit.farmId,
      this.nodeToEdit.nodeId,
      config,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        if (res instanceof Error) {
          this.ip4 = "";
          this.ip6 = "";
          this.gw4 = "";
          this.gw6 = "";
          this.domain = "";
          return;
        }
        const { events = [], status } = res;
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          if (!events.length) {
            if (this.openWarningDialog) this.$toasted.show("Adding Node public config failed");
            else if (this.openRemoveConfigWarningDialog) this.$toasted.show("Removing Node public config failed");

            this.loadingPublicConfig = false;
            this.openWarningDialog = false;
            this.openRemoveConfigWarningDialog = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ event: { method, section } }) => {
              if (section === "tfgridModule" && method === "NodePublicConfigStored") {
                if (this.openWarningDialog) this.$toasted.show("Node public config added!");
                else if (this.openRemoveConfigWarningDialog) {
                  this.$toasted.show("Node public config removed!");
                  this.ip4 = "";
                  this.ip6 = "";
                  this.gw4 = "";
                  this.gw6 = "";
                  this.domain = "";
                }
                this.$emit("updatePubConfig", { nodeid: this.nodeToEdit.nodeId, config });

                this.loadingPublicConfig = false;
                this.openPublicConfigDialog = false;
                this.openWarningDialog = false;
                this.openRemoveConfigWarningDialog = false;
              } else if (section === "system" && method === "ExtrinsicFailed") {
                if (this.openWarningDialog) this.$toasted.show("Adding Node public config failed");
                else if (this.openRemoveConfigWarningDialog) this.$toasted.show("Removing Node public config failed");
                this.loadingPublicConfig = false;
                this.openWarningDialog = false;
                this.openRemoveConfigWarningDialog = false;
              }
            });
          }
        }
      },
    ).catch(() => {
      if (this.openWarningDialog) this.$toasted.show("Adding Node public config failed");
      else if (this.openRemoveConfigWarningDialog) this.$toasted.show("Removing Node public config failed");
      this.loadingPublicConfig = false;
      this.openPublicConfigDialog = false;
      this.openWarningDialog = false;
      this.openRemoveConfigWarningDialog = false;
    });
  }
  removeConfig() {
    this.save(null);
  }
  openPublicConfig(node: nodeInterface) {
    // disable remove config btn
    if (node.publicConfig.ipv4 && node.publicConfig.gw4) this.hasPublicConfig = true;
    else this.hasPublicConfig = false;

    this.nodeToEdit = node;
    if (this.nodeToEdit.publicConfig) {
      this.ip4 = this.nodeToEdit.publicConfig.ipv4;
      this.gw4 = this.nodeToEdit.publicConfig.gw4;
      this.ip6 = this.nodeToEdit.publicConfig.ipv6;
      this.gw6 = this.nodeToEdit.publicConfig.gw6;
      this.domain = this.nodeToEdit.publicConfig.domain;
    }
    this.openPublicConfigDialog = true;
  }

  async openExtraFee(node: nodeInterface) {
    this.nodeToEdit = node;
    // convert fees from USD to mili USD while getting
    const fee = new Decimal(
      await this.queryClient.contracts.getDedicatedNodeExtraFee({ nodeId: this.nodeToEdit.nodeId }),
    );
    const feeUSD = fee.div(10 ** 3).toNumber();
    this.extraFee = feeUSD;
    this.openExtraFeeDialogue = true;
  }

  async saveExtraFee(fee: number) {
    this.loadingExtraFee = true;
    // convert fees from mili USD to USD while setting
    const feeDecimal = new Decimal(fee);
    const feeUSD = feeDecimal.mul(10 ** 3).toNumber();
    setDedicatedNodeExtraFee(this.$store.state.credentials.account.address, this.nodeToEdit.nodeId, feeUSD)
      .then(() => {
        this.$toasted.show(`Transaction succeeded: Fee is added to node ${this.nodeToEdit.nodeId}`);
        this.loadingExtraFee = false;
        this.openExtraFeeDialogue = false;
      })
      .catch(e => {
        this.loadingExtraFee = false;
        this.$toasted.show(`Transaction Failed: ${e}`);
      });
  }

  openDelete(node: { id: string }) {
    this.nodeToDelete = node;
    this.openDeleteDialog = true;
  }
  ip4check() {
    if (this.ip4 === "") return true;
    if (PrivateIp(this.ip4.split("/")[0])) {
      this.ip4ErrorMessage = "IP is not public";
      return false;
    }
    const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
    const ipRegex = new RegExp(`^${IPv4AddressFormat}/(1[6-9]|2[0-9]|3[0-2])$`);
    if (ipRegex.test(this.ip4) && ipaddr.isValid(this.ip4.split("/")[0])) {
      this.ip4ErrorMessage = "";
      if (this.gw4) (this.$refs.gw4Ref as unknown as { validate(): void }).validate();
      return true;
    } else {
      this.ip4ErrorMessage = "IP address is not formatted correctly";
      return false;
    }
  }
  ip6Validate() {
    const ip6Ref = this.$refs.ip6Ref as unknown as { validate(): void };
    ip6Ref?.validate();
  }
  ip6check() {
    if (!this.ip6) {
      if (this.gw6) {
        this.ip6ErrorMessage = "This field is required";
        return false;
      }
      this.gw6ErrorMessage = "";
      return true;
    }
    const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;

    const IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
    const ipRegex = new RegExp(
      "^(" +
        `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
        `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
        `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
        `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
        `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
        `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
        ")([0-9a-fA-F]{1})?/(1[6-9]|([2-5][0-9])|6[0-4])$",
    );
    if (PrivateIp(this.ip6.split("/")[0])) {
      this.ip6ErrorMessage = "IP is not public";
      return false;
    }
    if (ipRegex.test(this.ip6) && ipaddr.isValid(this.ip6.split("/")[0])) {
      this.ip6ErrorMessage = "";
      if (this.gw6) this.gw6Check();
      return true;
    } else {
      this.ip6ErrorMessage = "IPV6 address is not formatted correctly";
      return false;
    }
  }
  gw4Check() {
    if (!this.gw4) return true;
    if (PrivateIp(this.gw4.split("/")[0])) {
      this.gw4ErrorMessage = "Gateway is not public";
      return false;
    }
    const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
    const gatewayRegex = new RegExp(`^${IPv4AddressFormat}$`);
    let cidr: [IPv4 | IPv6, number];
    if (gatewayRegex.test(this.gw4) && ipaddr.isValid(this.gw4)) {
      const addr = ipaddr.parse(this.gw4);
      try {
        cidr = ipaddr.parseCIDR(this.ip4);
      } catch {
        this.gw4ErrorMessage = "Make sure you have provided the correct IPv4";
        return false;
      }
      if (!addr.match(cidr)) {
        this.gw4ErrorMessage = "Gateway is not a part of the given IP.";
        return false;
      }
      this.gw4ErrorMessage = "";
      return true;
    } else {
      this.gw4ErrorMessage = "Gateway is not formatted correctly";
      return false;
    }
  }
  gw6Validate() {
    const gw6Ref = this.$refs.gw6Ref as unknown as { validate(): void };
    gw6Ref?.validate();
  }
  gw6Check() {
    if (!this.gw6) {
      if (this.ip6) {
        this.gw6ErrorMessage = "This field is required";
        return false;
      }
      this.ip6ErrorMessage = "";
      return true;
    }
    if (PrivateIp(this.gw6.split("/")[0])) {
      this.gw6ErrorMessage = "Gateway is not public";
      return false;
    }
    const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;

    const IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
    const gatewayRegex = new RegExp(
      "^(" +
        `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
        `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
        `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
        `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
        `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
        `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
        ")([0-9a-fA-F]{1})?$",
    );
    if (gatewayRegex.test(this.gw6) && ipaddr.isValid(this.gw6)) {
      let cidr: [IPv4 | IPv6, number];
      try {
        cidr = ipaddr.parseCIDR(this.ip6);
      } catch {
        this.gw6ErrorMessage = "Make sure you have provided the correct IPv6";
        return false;
      }
      const addr = ipaddr.parse(this.gw6);
      if (!addr.match(cidr)) {
        this.gw6ErrorMessage = "Gateway is not a part of the given IP.";
        return false;
      }
      this.gw6ErrorMessage = "";
      return true;
    } else {
      this.gw6ErrorMessage = "Gateway is not formatted correctly";
      return false;
    }
  }
  domainCheck() {
    if (this.domain && !this.validator.isURL(this.domain)) return "Invalid url format";
    return true;
  }

  getTime(num: number | undefined) {
    if (num) {
      return new Date(num);
    }
    return new Date();
  }

  getNodeUptimePercentage(node: nodeInterface) {
    return getNodeUptimePercentage(node);
  }
  getStatus(node: { status: string }) {
    if (node.status === "up") return { color: "green", status: "Up" };
    else if (node.status === "standby") return { color: "orange", status: "Standby" };
    else return { color: "red", status: "Down" };
  }

  deleteItem() {
    this.loadingDelete = true;
    this.openDeleteDialog = false;
    deleteNode(
      this.$store.state.credentials.account.address,
      this.$api,
      parseInt(this.nodeToDelete.id.split("-")[1]),
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        if (res instanceof Error) {
          return;
        }
        const { events = [], status } = res;
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          // Loop through Vec<EventRecord> to display all events
          events.forEach(({ event: { method, section } }) => {
            if (section === "tfgridModule" && method === "NodeDeleted") {
              this.$toasted.show("Node deleted!");
              this.loadingDelete = false;
              this.openDeleteDialog = false;
              this.$emit("on:delete", this.nodeToDelete.id);
            } else if (section === "system" && method === "ExtrinsicFailed") {
              this.$toasted.show("Deleting a node failed");
              this.loadingDelete = false;
            }
          });
        }
      },
    ).catch(() => {
      this.$toasted.show("Deleting a node failed");
      this.loadingDelete = false;
    });
  }
  getPercentage(type: any) {
    if (!this.expanded[0].used_resources) return 0;
    const reservedResources = this.expanded[0].used_resources[type];
    const totalResources = this.expanded[0].total_resources[type];
    if (reservedResources === 0 && totalResources === 0) return 0;
    return (reservedResources / totalResources) * 100;
  }
}
</script>
