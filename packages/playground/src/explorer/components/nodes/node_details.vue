<template>
  <v-dialog
    v-model="dialog"
    @update:modelValue="(val:boolean) => $emit('close-details', val)"
    :scrim="false"
    transition="dialog-bottom-transition"
    fullscreen
    hide-overlay
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="() => $emit('close-details', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Node {{ node?.nodeId }}</v-toolbar-title>
      </v-toolbar>

      <div v-if="loading" class="d-flex justify-center" style="height: 100%">
        <div class="align-self-center d-flex flex-column align-center">
          <v-progress-circular indeterminate color="primary" :size="100" />
          <p class="pt-4 text-center">Loading Node {{ node?.nodeId ?? "" }} details</p>
        </div>
      </div>
      <template v-else>
        <div class="node-resources mt-10">
          <v-row justify="center">
            <v-col cols="8">
              <h2 class="node-resources-title text-center text-h4 flex justify-center items-center">
                <v-icon size="40" class="mr-2">mdi-chart-pie</v-icon>
                Node Resources
                <span :style="'color:' + (node?.status === 'up' ? '#4caf50' : '#f44336')">{{
                  node?.status === "up" ? "[Online]" : "Offline"
                }}</span>
              </h2>
            </v-col>
          </v-row>
          <!-- Details -->
          <v-row>
            <v-col cols="12">
              <div class="d-flex justify-center">
                <div v-for="item in resources" :key="item" class="mx-6 d-flex flex-column align-center">
                  <div>{{ item.name }}</div>
                  <div class="text-center">
                    <v-progress-circular
                      :model-value="isNaN(item.value) ? 0 : item.value"
                      :size="150"
                      :width="15"
                      color="primary"
                      v-if="isNaN(item.value)"
                      >NA
                    </v-progress-circular>
                    <v-progress-circular
                      :model-value="isNaN(item.value) ? 0 : item.value"
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
        </div>

        <div class="details mt-15">
          <v-row>
            <!-- Node Details -->
            <v-col cols="4">
              <v-card flat color="transparent" tag="div">
                <v-container>
                  <!-- Title -->
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="40" class="mr-2" color="#fff">mdi-resistor-nodes</v-icon>
                    </template>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 30px"> Node Details </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Details -->
                  <v-row>
                    <v-col cols="12">
                      <v-list lines="two">
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> ID </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ node?.nodeId }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Farm ID </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ node?.farmId }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Farming Policy ID </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ node?.farmingPolicyId }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> CPU </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ node?.total_resources.cru }} cores </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Disk (HDD) </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ toFixedCsSize(node?.total_resources.hru) }} </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Disk (SSD) </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ toFixedCsSize(node?.total_resources.sru) }} </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> RAM </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ toFixedCsSize(node?.total_resources.mru) }} </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Created </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ toHumanDate(node?.created) }} </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Certification Type </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ node?.certificationType }} </template>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
            <!-- Farm Details -->
            <v-col cols="4">
              <v-card flat color="transparent" tag="div">
                <v-container>
                  <!-- Title -->
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="40" class="mr-2" color="#fff">mdi-webpack</v-icon>
                    </template>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 30px"> Farm Details </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Details -->
                  <v-row>
                    <v-col cols="12">
                      <v-list lines="two">
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> ID </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ node?.farmId }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Name </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>Freefarm</template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-row align="center">
                            <v-col cols="4">
                              <v-list-item-content>
                                <v-list-item-title class="text-lg font-weight-bold">
                                  Stellar Address
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-col>
                            <v-col>
                              <v-text-field
                                class="py-2 w-full"
                                density="compact"
                                v-if="farmDetails?.stellarAddress"
                                :value="farmDetails?.stellarAddress"
                                readonly
                                hide-details
                                append-inner-icon="mdi-content-copy"
                                @click:append-inner="copy(farmDetails.stellarAddress)"
                                solo
                              />
                              <span v-else>None</span>
                            </v-col>
                          </v-row>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
            <!-- Location Details -->
            <v-col cols="4">
              <v-card flat color="transparent" tag="div">
                <v-container>
                  <!-- Title -->
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="40" class="mr-2" color="#fff">mdi-google-maps</v-icon>
                    </template>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 30px"> Location Details </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Details -->
                  <v-row>
                    <v-col cols="12">
                      <tf-map r="76" g="187" b="217" :nodes="JSON.stringify(nodesMap)"></tf-map>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <!-- Country Details -->
            <v-col cols="4">
              <v-card flat color="transparent" tag="div">
                <v-container>
                  <!-- Title -->
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="40" class="mr-2" color="#fff">mdi-map-outline</v-icon>
                    </template>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 30px" class="py-2"> Country Details </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Details -->
                  <v-row>
                    <v-col cols="12">
                      <v-list lines="two">
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Flag </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            <img :src="countryFlagSrc()" alt="flag" width="40" />
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Name </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ node?.country }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Code ISO 2 </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ getCountryCode() }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> City </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ node?.city }} </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Latitude </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ node?.location.latitude }} </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Longitude </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append> {{ node?.location.longitude }} </template>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
            <!-- Node Twin Details -->
            <v-col cols="4">
              <v-card flat color="transparent" tag="div">
                <v-container>
                  <!-- Title -->
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="40" class="mr-2" color="#fff">mdi-account</v-icon>
                    </template>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 30px"> Node Twin Details </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Details -->
                  <v-row>
                    <v-col cols="12">
                      <v-list lines="two">
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> ID </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ twinDetails?.twinId }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-row align="center">
                            <v-col cols="4">
                              <v-list-item-content>
                                <v-list-item-title class="text-lg font-weight-bold"> Account ID </v-list-item-title>
                              </v-list-item-content>
                            </v-col>
                            <v-col>
                              <v-text-field
                                class="py-2 w-full"
                                density="compact"
                                v-if="twinDetails?.accountId"
                                :value="twinDetails?.accountId"
                                readonly
                                hide-details
                                append-inner-icon="mdi-content-copy"
                                @click:append-inner="copy(twinDetails?.accountId)"
                                solo
                              />
                              <span v-else>None</span>
                            </v-col>
                          </v-row>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Relay </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>{{ twinDetails?.relay }}</template>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
            <!-- Interfaces Details -->
            <v-col cols="4">
              <v-card flat color="transparent" tag="div">
                <v-container>
                  <!-- Title -->
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="40" class="mr-2" color="#fff">mdi-boom-gate-outline</v-icon>
                    </template>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 30px"> Interfaces Details </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Details -->
                  <v-row>
                    <v-col cols="12">
                      <v-list lines="two">
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Name </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ interfacesDetails?.name }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> Mac Address </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ interfacesDetails?.mac }}
                          </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item class="text-lg font-weight-bold">
                          <v-list-item-content>
                            <v-list-item-title class="text-lg font-weight-bold"> IPs </v-list-item-title>
                          </v-list-item-content>
                          <template v-slot:append>
                            {{ interfacesDetails?.ips }}
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// import the styling for the toast
import "mosha-vue-toastify/dist/style.css";

import { byCountry } from "country-code-lookup";
import { createToast } from "mosha-vue-toastify";
import type { PropType } from "vue";
import { ref, watch } from "vue";

import { gqlClient, gridProxyClient } from "@/clients";
import toHumanDate from "@/utils/date";
import toFixedCsSize from "@/utils/to_fixed_cs_size";
export default {
  props: {
    openDetails: Boolean as PropType<boolean>,
    node: Object,
  },

  setup(props) {
    const dialog = ref(false);
    const loading = ref(true);
    const farmDetails = ref(null);
    const twinDetails = ref(null);
    const nodesMap = ref(null);
    const interfacesDetails = ref(null);
    const resources: any = ref([]);

    const getNodeResources = () => {
      if (props.node) {
        resources.value = [];
        const convertTxt = { cru: "CPU", sru: "SSD", hru: "HDD", mru: "RAM" };
        for (const resource in props.node.used_resources) {
          resources.value.push({
            name: convertTxt[resource] as string,
            value: ((props.node?.used_resources[resource] / props.node?.total_resources[resource]) * 100).toFixed(2),
          });
        }
      }
    };

    const getFarmDetails = async () => {
      if (props.node) {
        const { data } = await gridProxyClient.farms.list({ farmId: props.node?.farmId });
        // const res = await gqlClient.console.log(res);
        farmDetails.value = data[0] as any;
      }
    };

    const getTwinDetails = async () => {
      if (props.node) {
        const { data } = await gridProxyClient.twins.list({ twinId: props.node?.twinId });
        twinDetails.value = data[0] as any;
      }
    };

    const getStats = async () => {
      if (props.node) {
        const { nodesDistribution } = await gridProxyClient.stats.get();
        delete nodesDistribution[""];
        nodesMap.value = nodesDistribution as any;
      }
    };

    const getInterfaces = async () => {
      if (props.node) {
        const interfaces = await gqlClient.interfaces(
          { name: true, ips: true, mac: true },
          { where: { node: { nodeID_eq: props.node?.nodeId } } },
        );

        interfacesDetails.value = interfaces[0] as any;
      }
    };

    const loadData = async () => {
      loading.value = true;
      if (props.node) {
        await getFarmDetails();
        await getTwinDetails();
        await getStats();
        await getInterfaces();
        getNodeResources();
      }
      loading.value = false;
    };

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createToast("Copied!");
    };

    const countryFlagSrc = () => {
      const conuntryCode =
        props.node?.country && props.node?.country?.length > 2
          ? byCountry(props.node?.country)?.internet
          : props.node?.country;

      return conuntryCode?.toLocaleLowerCase() != "ch"
        ? `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.jpg`
        : `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.png`;
    };

    const getCountryCode = () => {
      return props.node?.country && props.node?.country?.length > 2
        ? byCountry(props.node?.country)?.internet
        : props.node?.country;
    };
    watch(
      () => props.openDetails,
      newValue => {
        dialog.value = newValue as boolean;
        if (newValue) {
          loadData();
        }
      },
    );
    return {
      dialog,
      loading,
      farmDetails,
      twinDetails,
      nodesMap,
      interfacesDetails,
      resources,
      toFixedCsSize,
      copy,
      toHumanDate,
      countryFlagSrc,
      getCountryCode,
    };
  },
};
</script>

<style scoped>
.v-list-item__prepend > .v-icon,
.v-list-item__append > .v-icon {
  opacity: 1 !important;
}
</style>
