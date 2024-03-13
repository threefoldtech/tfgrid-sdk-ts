<template>
  <view-layout>
    <TfFiltersContainer @apply="loadFarms" class="mb-4" :loading="loading">
      <TfFilter
        query-route="farm-id"
        v-model="filters.farmId"
        :rules="[
          validators.isNumeric('This field accepts numbers only.', {
            no_symbols: true,
          }),
          validators.min('The ID should be larger than zero.', 1),
          validators.isInt('should be an integer'),
          validators.validateResourceMaxNumber('This is not a valid ID.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Farm ID" variant="outlined" v-model="filters.farmId" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by farm id">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter query-route="farm-name" v-model="filters.farmName">
        <template #unwrap="{ colProps }">
          <VCol v-bind="colProps">
            <TfSelectFarm
              inset-tooltip
              variant="outlined"
              tooltip="Filter by farm name."
              :model-value="filters.farmName ? ({ name: filters.farmName } as any) : undefined"
              @update:model-value="filters.farmName = $event?.name || ''"
            />
          </VCol>
        </template>
      </TfFilter>

      <TfFilter
        query-route="free-public-ips"
        v-model="filters.freePublicIps"
        :rules="[
          validators.isNumeric('This field accepts numbers only.', {
            no_symbols: true,
          }),
          validators.min('Free Public IP should be larger than zero.', 1),
          validators.isInt('should be an integer'),
          validators.validateResourceMaxNumber('This is not a valid public IP.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Free Public IPs" variant="outlined" v-model="filters.freePublicIps" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by free public IPs">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>
    </TfFiltersContainer>

    <v-data-table-server
      :loading="loading"
      :headers="headers"
      :items="farms"
      :items-length="totalFarms"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 15, title: '15' },
      ]"
      :items-per-page="size"
      @update:items-per-page="
        size = $event;
        loadFarms();
      "
      :page="page"
      @update:page="
        page = $event;
        loadFarms();
      "
      :disable-sort="true"
      @click:row="openSheet"
    >
      <template #loading />
    </v-data-table-server>

    <v-dialog v-model="dialog" hide-overlay transition="dialog-bottom-transition">
      <v-container>
        <v-toolbar :height="35">
          <div class="ml-auto">
            <v-btn icon dark @click="() => (dialog = false)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-toolbar>

        <template v-if="loading">
          <div color="transparent" class="text-center">
            <v-progress-circular />
            <p>Loading farm details...</p>
          </div>
        </template>

        <template v-else>
          <v-card>
            <v-col>
              <farm-details-card :farm="selectedFarm" />
            </v-col>
            <v-col>
              <twin-details-card :farm="selectedFarm" />
            </v-col>
          </v-card>
        </template>
      </v-container>
    </v-dialog>
  </view-layout>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import { ref } from "vue";

import type { VDataTableHeader } from "@/types";
import { getAllFarms } from "@/utils/get_farms";
const loading = ref<boolean>(false);
const farms = ref<Farm[]>();

const page = ref(1);
const size = ref(window.env.PAGE_SIZE);
const filters = ref({
  farmId: "",
  farmName: "",
  freePublicIps: "",
});

const selectedFarm = ref<Farm>();
const dialog = ref(false);

const totalFarms = ref(0);

async function loadFarms() {
  loading.value = true;
  try {
    const { count, data } = await getAllFarms({
      retCount: true,
      farmId: +filters.value.farmId || undefined,
      freeIps: +filters.value.freePublicIps || undefined,
      nameContains: filters.value.farmName || undefined,
      page: page.value,
      size: size.value,
    });

    if (data) {
      totalFarms.value = count || 0;
      farms.value = data.map(farm => {
        const ips = farm.publicIps;
        const total = ips.length;
        const used = ips.filter(x => x.contract_id !== 0).length;
        return {
          ...farm,
          totalPublicIp: total,
          freePublicIp: total - used,
        };
      });
    }
  } catch (err) {
    console.log("could not get farms:", err);
    createCustomToast("Failed to get farms!", ToastType.danger);
  } finally {
    loading.value = false;
  }
}

const openSheet = (_e: any, { item }: any) => {
  openDialog(item.value);
};

const openDialog = (item: Farm) => {
  selectedFarm.value = item;
  dialog.value = true;
};

const headers: VDataTableHeader = [
  { title: "ID", key: "farmId", sortable: false },
  { title: "Name", key: "name", sortable: false },
  {
    title: "Total Public IPs",
    key: "totalPublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Available Public IPs",
    key: "freePublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Certification Type",
    key: "certificationType",
    align: "start",
    sortable: false,
  },
  {
    title: "Pricing Policy",
    key: "pricingPolicyId",
    align: "start",
    sortable: false,
  },
];
</script>

<script lang="ts">
import FarmDetailsCard from "@/components/node_details_cards/farm_details_card.vue";
import TwinDetailsCard from "@/components/node_details_cards/twin_details_card.vue";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import TfFilter from "../components/filters/TfFilter.vue";
import TfFiltersContainer from "../components/filters/TfFiltersContainer.vue";
import TfSelectFarm from "../components/node_selector/TfSelectFarm.vue";

export default {
  name: "Farms",
  components: {
    FarmDetailsCard,
    TwinDetailsCard,
    TfFiltersContainer,
    TfFilter,
    TfSelectFarm,
  },
};
</script>
