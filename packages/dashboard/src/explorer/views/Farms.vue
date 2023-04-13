<template>
  <Layout pageName="Farms">
    <template v-slot:filters>
      <LayoutFilters :items="filters.map(f => f.chip_label)" v-model="activeFiltersKeys" />
    </template>

    <template v-slot:active-filters>
      <div v-for="filter in activeFilters" :key="filter.label">
        <component
          :is="filter.component"
          :options="filter"
          v-model="filter.value"
          @input="onApplyFilter"
          @invalid="invalidFilter"
        />
      </div>
    </template>

    <template v-slot:table>
      <v-data-table
        :loading="loading"
        loading-text="Loading..."
        :headers="headers"
        class="elevation-1"
        align
        :items-per-page="15"
        :server-items-length="farms.total"
        :items="items"
        :disable-pagination="loading"
        :page="page + 1"
        :footer-props="{
          'disable-items-per-page': true,
          'disable-pagination': loading,
        }"
        @click:row="openSheet"
        :disable-sort="false"
        multi-sort
        @update:options="onUpdateOptions($event.page, $event.sortBy, $event.sortDesc)"
      >
        <template v-slot:[`item.certificationType`]="{ item }">
          {{ item.certificationType || "None" }}
        </template>

        <template v-slot:[`item.publicIPs`]="{ item }">
          {{ item.publicIPs.length }}
        </template>

        <template v-slot:[`item.createdAt`]="{ item }">
          {{ item.createdAt | date }}
        </template>

        <template v-slot:[`item.updatedAt`]="{ item }">
          <v-icon :color="item.updatedAt ? 'green' : 'red'">
            {{ item.updatedAt ? "mdi-check" : "mdi-close" }}
          </v-icon>
        </template>

        <template v-slot:[`item.totalPublicIp`]="{ item }">
          {{ item.totalPublicIp }}
        </template>

        <template v-slot:[`item.freePublicIp`]="{ item }">
          {{ item.freePublicIp }}
        </template>

        <template v-slot:[`item.usedPublicIp`]="{ item }">
          {{ item.usedPublicIp }}
        </template>

        <template v-slot:[`item.pricingPolicyId`]="{ item }">
          {{ pricingPolicy(item.pricingPolicyId) }}
        </template>
      </v-data-table>
    </template>

    <template v-slot:details>
      <DetailsV2
        :open="!!farm"
        :query="query"
        :variables="farm ? { farmId: farm.id, twinId: farm.twinId } : {}"
        v-on:close-sheet="closeSheet"
      />
    </template>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import DetailsV2 from "../components/DetailsV2.vue";
import { getFarmsQuery, getPricingPolicies, IFarm, IFetchPaginatedData } from "../graphql/api";
import Layout from "../components/Layout.vue";
import { IPaginationData } from "../store/state";
import { PAGE_LIMIT } from "../json/constants";
import InFilterV2 from "../components/InFilterV2.vue";
import IFilterOptions from "../types/FilterOptions";
import getFarmPublicIPs from "../utils/getFarmPublicIps";
import gql from "graphql-tag";
import equalArrays from "../utils/equalArrays";
import LayoutFilters from "../components/LayoutFilters.vue";
@Component({
  components: {
    Layout,
    DetailsV2,
    InFilterV2,
    LayoutFilters,
  },
})
export default class Farms extends Vue {
  sort: { by: string[]; desc: boolean[] } = { by: [], desc: [] };
  value = "";
  page = 0;
  loading = false;
  changed = false;
  invalid = false;
  NotChecked = false;
  // prettier-ignore
  headers = [
    { text: "ID", value: "id" },
    { text: "NAME", value: "name" },
    { text: "Total Public IPs", value: "totalPublicIp", align: "center", sortable: false },
    { text: "Free Public IPs", value: "freePublicIp", align: "center", sortable: false },
    { text: "Used Public IPs", value: "usedPublicIp", align: "center", sortable: false },
    { text: "CERTIFICATION TYPE", value: "certificationType", align: "center", sortable: false },
    { text: "PRICING POLICY", value: "pricingPolicyId", align: "center", sortable: false },
  ];
  date: any;
  get farms(): IPaginationData<IFarm> {
    return this.$store.state.explorer.farms;
  }
  get items(): IFarm[] | undefined {
    return this.farms.items.get(this.page);
  }
  private get _pricingPolicy(): Map<number, string> {
    return this.$store.state.explorer.pricingPolicies;
  }
  onUpdateOptions(page: number, sortBy: string[], sortDesc: boolean[]) {
    const _by = this.sort.by;
    const _desc = this.sort.desc;
    this.page = page - 1;
    this.sort = {
      by: sortBy,
      desc: sortDesc,
    };
    if (!equalArrays(_by, sortBy) || !equalArrays(_desc, sortDesc)) {
      this.onApplyFilter();
    }
  }
  public pricingPolicy(id: number) {
    const name = this._pricingPolicy.get(id);
    return name ? name : id;
  }
  private _vars: any = {};
  @Watch("page", { immediate: true })
  public onUpdatePage() {
    if (this.items) return;
    this.loading = true;
    this.$apollo
      .query<IFetchPaginatedData<IFarm>>({
        query: getFarmsQuery,
        variables: {
          limit: PAGE_LIMIT,
          offset: this.page * PAGE_LIMIT,
          ...this._vars,
        },
      })
      .then(
        ({
          data: {
            total: { count },
            items,
          },
        }) => {
          this.$store.state.explorer.farms = {
            total: count,
            items: this.farms.items.set(this.page, items.map(getFarmPublicIPs)),
          };
        },
      )
      .catch(() => {
        /* Pass */
      })
      .finally(() => {
        this.loading = false;
      });
    this.$apollo
      .query({
        query: getPricingPolicies,
      })
      .then(({ data }) => {
        const ids = data.pricingPolicies.map((policy: any) => policy.pricingPolicyID);
        this.$store.state.explorer.pricingPoliciesIds = ids;
      });
  }
  public getKeyByValue(value: string): number | null {
    const map = this._pricingPolicy;
    const keys = [...map.keys()];
    const values = [...map.values()];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === value) return +keys[i];
    }
    return null;
  }
  public onApplyFilter() {
    this.changed = false;
    const _vars: any = this.activeFilters
      .filter(f => (Array.isArray(f.value) ? f.value.length > 0 : true))
      .reduce((res, f) => {
        const { symbol, value, getValue } = f;
        const symbolValue = getValue?.(f) ?? value;
        if (symbolValue != null && symbolValue != 0) {
          res[symbol] = symbolValue;
        }
        return res;
      }, {} as { [key: string]: any });
    this._vars = _vars;
    this.$store.state.explorer.farms = {
      total: 0,
      items: new Map(),
    };
    if (this.page === 0) this.onUpdatePage();
    else this.page = 0;
  }
  activeFiltersKeys: string[] = ["Farm ID", "Name"];
  get activeFilters(): IFilterOptions[] {
    const keySet = new Set(this.activeFiltersKeys);
    return this.filters.filter(f => keySet.has(f.chip_label));
  }
  public filters: IFilterOptions[] = [
    {
      component: InFilterV2,
      chip_label: "Farm ID",
      label: "Filter By Farm ID",
      items: () => Promise.resolve([]),
      value: [],
      multiple: false,
      symbol: "farmId_in",
      key: "farmID",
      getValue: f => {
        return +f.value;
      },
    },
    {
      component: InFilterV2,
      chip_label: "Name",
      label: "Filter By Farm Name",
      items(sub_string: string) {
        return fetch(`${window.configs.APP_GRIDPROXY_URL}/farms?name_contains=${sub_string}`)
          .then(res => {
            return res.json();
          })
          .then((data: any) => {
            return data.map((x: any) => x.name);
          });
      },
      value: [],
      multiple: false,
      symbol: "name_in",
      key: "farm_name",
    },
    {
      component: InFilterV2,
      chip_label: "Twin ID",
      label: "Filter By Twin ID",
      items: () => Promise.resolve([]),
      value: [],
      multiple: false,
      symbol: "twinId_in",
      key: "twinId",
      getValue: f => {
        return +f.value;
      },
    },
    {
      component: InFilterV2,
      chip_label: "Certification Type",
      label: "Filter By Certification Type",
      items: () => Promise.resolve(["Gold", "NotCertified"]),
      value: [],
      init: true,
      multiple: false,
      symbol: "certificationType_in",
      key: "certificationType",
    },
    {
      component: InFilterV2,
      chip_label: "Pricing Policy",
      label: "Filter By Pricing policy",
      items: () => Promise.resolve(this.$store.state.explorer.pricingPoliciesIds),
      value: [],
      init: true,
      multiple: true,
      symbol: "pricingPolicyId_in",
      key: "pricingPolicyId",
      getValue: f => {
        return +f.value;
      },
    },
  ];
  query = gql`
    query getFarmDetails($farmId: Int!, $twinId: Int!) {
      farm: farms(where: { farmID_eq: $farmId }) {
        id
        farmId: farmID
        name
        gridVersion
        certificationType: certification
        stellarAddress
      }
      twin: twins(where: { twinID_eq: $twinId }) {
        id
        twinId: twinID
        accountId: accountID
        gridVersion
        relay
      }
    }
  `;
  farm: IFarm | null = null;
  openSheet(farm: IFarm): void {
    this.farm = farm;
  }
  closeSheet(): void {
    this.farm = null;
  }

  invalidFilter(event: { symbol: string; invalid: boolean }) {
    const checkFilter = this.activeFilters.find(f => f.symbol === event.symbol);
    if (checkFilter) {
      checkFilter.invalid = event.invalid;
    }
  }

  isInvalid(): boolean {
    return this.activeFilters.some(f => f.invalid === true);
  }
}
</script>
