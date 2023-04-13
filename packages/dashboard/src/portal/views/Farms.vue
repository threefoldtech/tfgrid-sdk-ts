<template>
  <v-container fluid>
    <!-- show only if the twin has no farms -->
    <v-card color="primary" class="white--text my-3 pa-3 text-center d-flex justify-center align-baseline">
      <h3 v-if="farms.length == 0">Don't have any farms? Start by creating one:</h3>
      <h3 v-else>Create another farm:</h3>

      <v-btn @click="openCreateFarmDialog = true" class="farm my-3 mx-5" :loading="loadingCreateFarm"
        >Create farm</v-btn
      >
    </v-card>

    <!-- creating farm form -->
    <v-dialog transition="dialog-bottom-transition" v-model="openCreateFarmDialog" max-width="500">
      <v-card>
        <v-toolbar color="primary" class="white--text">Create Farm</v-toolbar>
        <v-card-text>
          <v-form v-model="isValidFarmName" v-on:submit.prevent>
            <v-text-field
              label="Farm Name"
              v-model="farmName"
              required
              :error-messages="farmNameErrorMessage"
              :rules="[
                () => !!farmName || 'This field is required',
                farmNameCheck,
                () => farmName.length <= 40 || 'Name too long, only 40 characters permitted',
                () => farmName.length >= 3 || 'Name should be more than or equal 3 characters',
              ]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="primary white--text"
            @click="createFarmFromName"
            :loading="loadingCreateFarm"
            :disabled="!isValidFarmName"
            >Submit</v-btn
          >
          <v-btn @click="openCreateFarmDialog = false" color="grey lighten-2 black--text">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-text-field v-model="searchTerm" color="primary darken-2" label="Search by farm name or ID"></v-text-field>

    <!-- Farms table -->
    <v-data-table
      :headers="headers"
      :items="farms.length ? filteredFarms() : []"
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      item-key="name"
      show-expand
      class="elevation-1"
      :loading="loadingFarms"
      :loading-text="'loading farms ...'"
    >
      <template v-slot:top>
        <v-toolbar flat class="primary white--text">
          <v-toolbar-title>Your Farms</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>

      <!-- details panel -->
      <template v-slot:expanded-item="{ item }">
        <td :colspan="headers.length">
          <v-container fluid class="text-left">
            <v-row>
              <v-col>
                <v-flex class="text-left pr-2">Farm ID</v-flex>
              </v-col>
              <v-col>
                <v-flex class="text-truncate font-weight-bold">
                  <span>{{ item.id }}</span>
                </v-flex>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-flex class="text-left pr-2">Farm Name</v-flex>
              </v-col>
              <v-col>
                <v-flex class="text-truncate font-weight-bold">
                  <span>{{ item.name }}</span>
                </v-flex>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-flex class="text-left pr-2">Linked Twin ID</v-flex>
              </v-col>
              <v-col>
                <v-flex class="text-truncate font-weight-bold">
                  <span>{{ item.twinId }}</span>
                </v-flex>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-flex class="text-left pr-2">Certification Type</v-flex>
              </v-col>
              <v-col>
                <v-flex class="text-truncate font-weight-bold">
                  <span>{{ item.certification }}</span>
                </v-flex>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-flex class="text-left">Linked Pricing Policy ID</v-flex>
              </v-col>
              <v-col>
                <v-flex class="text-truncate font-weight-bold">
                  <span>{{ item.pricingPolicyId }}</span>
                </v-flex>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-flex class="text-left">Stellar Payout Address</v-flex>
              </v-col>
              <v-col v-if="item.v2address">
                <v-row
                  class="d-flex align-baseline justify-between"
                  style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
                >
                  <v-row style="margin: 0">
                    <span style="font-size: small">
                      {{ item.v2address }}
                    </span>
                  </v-row>
                  <v-btn x-small @click="openV2AddressDialog = true">Edit</v-btn>
                </v-row>
              </v-col>
              <v-col v-else>
                <v-flex>
                  <v-btn x-small @click="openV2AddressDialog = true">Add V2 Address</v-btn>
                </v-flex>
              </v-col>
              <v-dialog transition="dialog-bottom-transition" v-model="openV2AddressDialog" max-width="500">
                <v-card>
                  <v-toolbar color="primary">Add/Edit V2 Stellar Address</v-toolbar>
                  <v-card-text>
                    <v-form v-model="isValidStellarV2Address">
                      <v-text-field
                        v-model="v2_address"
                        label="Stellar Wallet Address"
                        :rules="[
                          () => !!v2_address || 'This field is required',
                          () => stellarAddressCheck() || 'invalid address',
                        ]"
                      >
                      </v-text-field>
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="justify-end">
                    <v-btn @click="openV2AddressDialog = false" color="grey lighten-2 black--text">Close</v-btn>
                    <v-btn
                      @click="addV2Address"
                      color="primary white--text"
                      :disabled="!isValidStellarV2Address"
                      :loading="loadingAddStellar"
                      >Submit</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-row>
            <v-row>
              <v-col>
                <v-flex class="text-left">Bootstrap Node Image</v-flex>
              </v-col>
              <v-col>
                <v-flex>
                  <v-btn x-small v-bind:href="'https://v3.bootstrap.grid.tf/'" target="blank">view bootstrap</v-btn>
                </v-flex>
              </v-col>
            </v-row>

            <PublicIPTable
              :ips="item.publicIps"
              :deleteIP="deletePublicIP"
              :loadingDelete="loadingDeleteIP"
              :createIP="createPublicIPs"
              :loadingCreate="loadingCreateIP"
            />
          </v-container>
        </td>
      </template>
    </v-data-table>

    <!-- Nodes table -->
    <FarmNodesTable
      v-if="nodes.length"
      :nodes="nodes"
      :loadingNodes="loadingNodes"
      :initLoading="initLoading"
      :count="count"
      @on:delete="getNodes()"
      @options-changed="onOptionChange($event.pageNumber, $event.pageSize)"
      @updatePubConfig="updatePubConfigs($event.nodeid, $event.config)"
    />

    <!-- delete farm form -->
    <v-dialog v-model="openDeleteFarmDialog" max-width="700px">
      <v-card>
        <v-card-title class="text-h5">Are you certain you want to delete this farm?</v-card-title>
        <v-card-text>This will delete the farm on the chain, this action is irreversible</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-2 black--text" text @click="openDeleteFarmDialog = false">Cancel</v-btn>
          <v-btn color="primary white--text" text :loading="loadingDeleteFarm" @click="callDeleteFarm()">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import FarmNodesTable from "../components/FarmNodesTable.vue";
import PublicIPTable from "../components/PublicIPTable.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
import {
  createFarm,
  batchCreateIP,
  deleteFarm,
  deleteIP,
  getFarm,
  getNodesByFarmID,
  setFarmPayoutV2Address,
} from "../lib/farms";
import { StrKey } from "stellar-sdk";

@Component({
  name: "FarmsView",
  components: { PublicIPTable, FarmNodesTable },
})
export default class FarmsView extends Vue {
  headers = [
    { text: "Farm ID", value: "id", align: "center" },
    { text: "Farm name", value: "name", align: "center" },
    { text: "Linked Twin ID", value: "twinId", align: "center" },
    { text: "Certification type", value: "certification", align: "center" },
    { text: "Pricing Policy ID", value: "pricingPolicyId", align: "center" },
  ];
  farms: any = [];
  singleExpand = true;
  expanded: any = [];
  $api: any;
  openV2AddressDialog = false;
  openCreateFarmDialog = false;
  v2_address = "";
  farmName = "";
  farmNameErrorMessage = "";
  loadingCreateIP = false;
  loadingDeleteIP = false;
  nodes: any = [];
  loadingNodes = true;
  loadingNodeDelete = false;
  loadingAddNodePublicConfig = false;
  loadingDeleteFarm = false;
  openDeleteFarmDialog = false;
  farmToDelete: any = {};
  searchTerm = "";
  loadingCreateFarm = false;
  isValidFarmName = false;
  isValidStellarV2Address = false;
  loadingAddStellar = false;
  loadingFarms = true;

  page = 1;
  size = 10;
  count = 0;
  farmsIds: any;
  initLoading = false;

  // Life hooks
  async mounted() {
    // not logged in? login: get farms, nodes
    if (this.$api && this.$store.state.credentials) {
      this.farms = await getFarm(this.$api, this.$store.state.credentials.twin.id);
      this.loadingFarms = false;

      this.initLoading = true;
      await this.getNodes();
      this.initLoading = false;
    } else {
      this.$router.push({
        name: "accounts",
        path: "/",
      });
    }
  }

  async updated() {
    this.v2_address;
    this.farmName;
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }

  // Watchers
  @Watch("$store.state.credentials.twin.id") async onPropertyChanged(value: number, oldValue: number) {
    console.log(`switching from account ${oldValue} farms to account ${value} farms`);
    this.farms = await getFarm(this.$api, value);

    await this.getNodes();
  }
  @Watch("farms.length") async onFarmCreation(value: number, oldValue: number) {
    console.log(`there were ${oldValue} farms, now there is ${value} farms`);
  }
  @Watch("nodes.length") async onNodeDeleted(value: number, oldValue: number) {
    console.log(`there were ${oldValue} nodes, now there is ${value} nodes`);
  }

  // Searching disable for now.
  public filteredFarms() {
    if (this.farms.length > 0) {
      return this.farms.filter(
        (farm: { name: string; id: any }) =>
          farm.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || `${farm.id}`.includes(this.searchTerm),
      );
    }
    return this.farms;
  }

  // Node table listing
  async onOptionChange(pageNumber: number, pageSize: number) {
    if (this.page === pageNumber && this.size === pageSize) return;
    this.page = pageNumber;
    this.size = pageSize;
    await this.getNodes();
  }

  async getNodes() {
    this.farmsIds = this.farms.map((farm: any) => farm.id);

    if (this.farmsIds.length == 0) return;

    console.log(`Request nodes with params. farmids: ${this.farmsIds}, page: ${this.page}, size: ${this.size}`);

    this.loadingNodes = true;
    let { nodes, count } = await getNodesByFarmID(this.farmsIds, this.page, this.size);
    this.nodes = nodes;
    this.count = count;
    this.loadingNodes = false;
  }

  // Methods
  openDeleteFarm(farm: any) {
    this.farmToDelete = farm;
    this.openDeleteFarmDialog = true;
  }

  callDeleteFarm() {
    this.loadingDeleteFarm = true;
    deleteFarm(
      this.$route.params.accountID,
      this.$api,
      this.farmToDelete.id,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        console.log(res);
        if (res instanceof Error) {
          console.log(res);
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("Deleting a farm failed");
            this.loadingDeleteFarm = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "tfgridModule" && method === "FarmDeleted") {
                this.$toasted.show("Farm deleted!");
                this.loadingDeleteFarm = false;
                this.openDeleteFarmDialog = false;
                this.farms = getFarm(this.$api, this.$store.state.credentials.twin.id);
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Deleting a farm failed");
                this.loadingDeleteFarm = false;
              }
            });
          }
        }
      },
    ).catch((err: { message: string }) => {
      this.$toasted.show(err.message);
      this.loadingDeleteFarm = false;
    });
  }

  deletePublicIP(publicIP: any) {
    this.loadingDeleteIP = true;
    return deleteIP(
      this.$route.params.accountID,
      this.$api,
      this.expanded[0].id,
      publicIP,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        console.log(res);
        if (res instanceof Error) {
          console.log(res);
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("IP deletion failed!");
            this.loadingDeleteIP = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "tfgridModule" && method === "FarmUpdated") {
                this.$toasted.show("IP deleted!");
                getFarm(this.$api, this.$store.state.credentials.twin.id).then(farms => {
                  this.farms = farms;
                  this.loadingDeleteIP = false;
                });
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("IP deletion failed!");
                this.loadingDeleteIP = false;
              }
            });
          }
        }
      },
    ).catch(err => {
      this.$toasted.show(err.message);
      this.loadingDeleteIP = false;
    });
  }

  public createPublicIPs(publicIPs: string[], gateway: string) {
    this.loadingCreateIP = true;
    return new Promise((resolve, reject) => {
      const callback = (res: {
        events?: never[] | undefined;
        status: { type: string; asFinalized: string; isFinalized: string };
      }) => {
        if (res instanceof Error) {
          reject(res);
          this.loadingCreateIP = false;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`phase: ${phase}, section: ${section}, method: ${method}`);
            if (section === "utility" && method === "BatchCompleted") {
              this.$toasted.show("IP created!");
              getFarm(this.$api, this.$store.state.credentials.twin.id).then(farms => {
                this.farms = farms;
              });
              resolve("IP created!");
              this.loadingCreateIP = false;
            } else if (section === "utility" && method === "BatchInterrupted") {
              this.$toasted.show("Adding an IP failed!");
              reject("Adding an IP failed!");
              this.loadingCreateIP = false;
            }
          });
        }
      };
      try {
        batchCreateIP(this.$route.params.accountID, this.$api, this.expanded[0].id, publicIPs, gateway, callback).catch(
          e => {
            console.log("error from catch batch", e);
            this.$toasted.show(`Transaction cancelled`);
            this.loadingCreateIP = false;
          },
        );
      } catch (e) {
        reject(e);
        this.loadingCreateIP = false;
      }
    });
  }

  public farmNameCheck() {
    const nameRegex = new RegExp("^[a-zA-Z0-9_-]*$");
    if (nameRegex.test(this.farmName)) {
      this.farmNameErrorMessage = "";
      return true;
    } else {
      this.farmNameErrorMessage = "Name is not formatted correctly (All letters + numbers and (-,_) are allowed";
      return false;
    }
  }

  public createFarmFromName() {
    this.loadingCreateFarm = true;

    createFarm(
      this.$route.params.accountID,
      this.$api,
      this.farmName,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        console.log(res);
        if (res instanceof Error) {
          console.log(res);
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
            this.openCreateFarmDialog = false;
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("Farm creation failed!");
            this.openCreateFarmDialog = false;
            this.loadingCreateFarm = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "tfgridModule" && method === "FarmStored") {
                this.$toasted.show("Farm created!");
                this.loadingCreateFarm = false;
                this.farmName = "";
                getFarm(this.$api, this.$store.state.credentials.twin.id).then(farms => {
                  this.farms = farms;
                });
                this.openCreateFarmDialog = false;
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Farm creation failed!");
                this.openCreateFarmDialog = false;
                this.loadingCreateFarm = false;
              }
            });
          }
        }
      },
    ).catch(err => {
      this.$toasted.show(err.message);
      this.openCreateFarmDialog = false;
      this.loadingCreateFarm = false;
    });
  }

  stellarAddressCheck() {
    const isValid = StrKey.isValidEd25519PublicKey(this.v2_address);
    if (isValid && !this.v2_address.match(/\W/)) {
      return true;
    } else {
      return false;
    }
  }

  public addV2Address() {
    this.loadingAddStellar = true;
    setFarmPayoutV2Address(
      this.$route.params.accountID,
      this.$api,
      this.expanded[0].id, //farm ID
      this.v2_address,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        console.log(res);
        if (res instanceof Error) {
          console.log(res);
          this.loadingAddStellar = false;
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("Adding a V2 address failed!");
            this.openV2AddressDialog = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "tfgridModule" && method === "FarmPayoutV2AddressRegistered") {
                this.$toasted.show("Address added!");
                getFarm(this.$api, this.$store.state.credentials.twin.id).then(farms => {
                  this.farms = farms;
                });
                this.openV2AddressDialog = false;
                this.loadingAddStellar = false;
                this.v2_address = "";
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Adding a V2 address failed!");
                this.openV2AddressDialog = false;
                this.loadingAddStellar = false;
                this.v2_address = "";
              }
            });
          }
        }
      },
    ).catch(err => {
      this.$toasted.show(err.message);
      this.openV2AddressDialog = false;
      this.loadingAddStellar = false;
      this.v2_address = "";
    });
  }

  async updatePubConfigs(nodeid: any, config: any) {
    this.loadingNodes = true;

    let current = this.nodes.findIndex((n: any) => n.nodeId == nodeid);
    this.nodes[current].publicConfig = {
      ipv4: config?.ip4.ip || "",
      gw4: config?.ip4.gw || "",
      ipv6: config?.ip6.ip || "",
      gw6: config?.ip6.gw || "",
      domain: config?.domain || "",
    };

    this.loadingNodes = false;
  }
}
</script>

<style scoped>
.v2address {
  overflow: hidden;
  text-overflow: ellipsis;
}
.theme--dark.v-btn.v-btn--has-bg {
  background-color: #064663;
}
.farm {
  font-weight: 500 !important;
}
</style>
