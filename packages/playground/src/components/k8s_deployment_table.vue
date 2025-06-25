<template>
  <div>
    <v-alert v-if="!loading && count && items.length < count" type="warning" variant="tonal">
      Failed to load <strong>{{ count - items.length }}</strong> deployment{{ count - items.length > 1 ? "s" : "" }}.

      <span>
        This might happen because the node is down or it's not reachable
        <span v-if="showEncryption">
          or the deployment{{ count - items.length > 1 ? "s are" : " is" }} encrypted by another key </span>.
      </span>
      <v-tooltip location="top" text="Show failed deployments">
        <template #activator="{ props: tooltipProps }">
          <v-icon v-bind="tooltipProps" class="custom-icon" @click="showDialog = true">
            mdi-file-document-refresh-outline
          </v-icon>
        </template>
      </v-tooltip>

      <v-dialog v-model="showDialog" transition="dialog-bottom-transition" attach="#modals">
        <v-card>
          <v-card-title style="color: #ffcc00; font-weight: bold"> Failed Deployments </v-card-title>
          <v-divider color="#FFCC00" />
          <v-card-text>
            <v-alert type="error" variant="tonal">
              Failed to load
              <strong>{{ count - items.length }}</strong> deployment{{ count - items.length > 1 ? "s" : "" }}.

              <span>
                This might happen because the node is down or it's not reachable
                <span v-if="showEncryption">or the deployment{{ count - items.length > 1 ? "s are" : " is" }} encrypted by another key</span>.
              </span>
            </v-alert>
            <li v-for="deployment in failedDeployments" :key="deployment.name">
              {{
                deployment.nodes.length > 0
                  ? `${deployment.name} on node${deployment.nodes.length > 1 ? "s" : ""}: ${deployment.nodes.join(
                      ", ",
                    )}`
                  : deployment.name
              }}
              <template v-if="deployment.contracts && deployment.contracts.length > 0">
                with contract id:
                <span v-for="contract in deployment.contracts" :key="contract.contractID">
                  {{ contract.contractID }} .
                </span>
              </template>
            </li>
          </v-card-text>
          <v-card-actions class="justify-end my-1 mr-2">
            <v-btn color="anchor" @click="showDialog = false"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-alert>

    <AccessDeploymentAlert />

    <div
      class="d-flex flex-column flex-sm-row"
      :class="[props.projectName.toLowerCase() === 'kubernetes' ? 'justify-sm-space-between' : 'flex-sm-row-reverse']"
    >
      <InputTooltip tooltip="Didn't find your deployments in the list? Enable to show all deployments." inline>
        <VSwitch
          v-model="showAllDeployments"
          inset
          color="primary"
          label="Show All Deployments"
          @update:model-value="loadDeployments"
        />
      </InputTooltip>

      <VBtn
        :disabled="loading"
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-reload"
        text="Reload"
        class="my-4"
        @click="loadDeployments"
      />
    </div>
    <ListTable
      :headers="[
        { title: 'PLACEHOLDER', key: 'data-table-select' },
        { title: 'Name', key: 'name' },
        {
          title: 'Networks',
          key: 'networks',
          sortable: false,
          children: [
            { title: 'Public IPv4', key: 'ipv4', sortable: false },
            { title: 'Mycelium IP', key: 'mycelium', sortable: false },
          ],
        },
        { title: 'Workers', key: 'workersLength' },
        { title: 'Billing Rate', key: 'billing' },
        { title: 'Created At', key: 'created' },
        { title: 'Health', key: 'status', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false },
      ]"
      :items="showAllDeployments ? items : items.filter(i => !i.fromAnotherClient)"
      :loading="loading"
      :deleting="deleting"
      :model-value="$props.modelValue"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
      ]"
      :sort-by="sortBy"
      @update:model-value="$emit('update:model-value', $event)"
      @click:row="$attrs['onClick:row']"
    >
      <template #[`item.created`]="{ item }">
        {{ toHumanDate(item.masters[0].created) }}
      </template>

      <template #[`item.mycelium`]="{ item }">
        {{ item.masters[0].myceliumIP || "-" }}
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getNodeHealthColor(item.masters[0].status as string).color">
          <v-tooltip v-if="item.masters[0].status == NodeHealth.Error" activator="parent" location="top">
            {{ item.masters[0].message }}
          </v-tooltip>
          <v-tooltip v-if="item.masters[0].status == NodeHealth.Paused" activator="parent" location="top">
            The deployment contract is in grace period
          </v-tooltip>
          <span class="text-uppercase">
            {{ getNodeHealthColor(item.masters[0].status as string).type }}
          </span>
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-chip v-if="deleting && ($props.modelValue || []).includes(item.value)" color="error"> Deleting... </v-chip>
        <v-btn-group v-else variant="tonal">
          <slot name="actions" :item="item" />
        </v-btn-group>
      </template>

      <template #no-data-text>
        <div v-if="failedDeployments.length > 0" class="text-center">
          <p v-text="'Couldn\'t load any of your Kubernetes deployments.'" />
          <VBtn
            class="mt-4"
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-reload"
            text="Reload"
            @click="loadDeployments"
          />
        </div>
        <p v-else v-text="'No Kubernetes deployments found on this account.'" />
      </template>
    </ListTable>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { getNodeHealthColor, NodeHealth } from "@/utils/get_nodes";

import { useProfileManager } from "../stores";
import { getGrid, updateGrid } from "../utils/grid";
import { markAsFromAnotherClient } from "../utils/helpers";
import { loadK8s, mergeLoadedDeployments } from "../utils/load_deployment";
const profileManager = useProfileManager();
const showDialog = ref(false);
const showEncryption = ref(false);
const showAllDeployments = ref(false);
const failedDeployments = ref<any[]>([]);

const props = defineProps<{
  projectName: string;
  modelValue: any[];
  deleting: boolean;
}>();
defineEmits<{ (event: "update:model-value", value: any[]): void }>();

const count = ref<number>();
const items = ref<any[]>([]);
const loading = ref(false);

onMounted(loadDeployments);
async function loadDeployments() {
  const start = performance.now();
  items.value = [];
  loading.value = true;
  try {
    const grid = await getGrid(profileManager.profile!, props.projectName);
    if (!grid) {
      loading.value = false;
      console.error("Failed to initialize grid connection");
      return;
    }
    const results = await Promise.allSettled([
      loadK8s(grid),
      loadK8s(updateGrid(grid, { projectName: props.projectName.toLowerCase() })),
      showAllDeployments.value
        ? loadK8s(updateGrid(grid, { projectName: "" }))
        : Promise.resolve({ count: 0, items: [], failedDeployments: [] }),
    ]);
    const chunk1 =
      results[0].status === "fulfilled"
        ? results[0].value
        : (() => {
            console.error("Failed to load K8s deployments from default project:", results[0].reason);
            return { count: 0, items: [], failedDeployments: [] };
          })();
    const chunk2 =
      results[1].status === "fulfilled"
        ? results[1].value
        : (() => {
            console.error(`Failed to load K8s deployments from project "${props.projectName}":`, results[1].reason);
            return { count: 0, items: [], failedDeployments: [] };
          })();
    const chunk3 =
      results[2].status === "fulfilled"
        ? results[2].value
        : (() => {
            console.error("Failed to load K8s deployments from all projects:", results[2].reason);
            return { count: 0, items: [], failedDeployments: [] };
          })();
    if (chunk3.items) {
      chunk3.items = chunk3.items.map(i => {
        return !i.projectName || i.projectName === "Kubernetes" ? markAsFromAnotherClient(i) : i;
      });
    }
    const clusters = mergeLoadedDeployments(chunk1, chunk2, chunk3);
    failedDeployments.value = clusters.failedDeployments;
    count.value = clusters.count;
    items.value = clusters.items.map(item => {
      const master = item.masters[0];
      const publicIP = master.publicIP?.ip;
      return {
        ...item,
        name: item.deploymentName,
        ipv4: publicIP ? publicIP.split("/")?.[0] || publicIP : "-",
        ipv6: master.publicIP?.ip6?.replace(/\/64$/, "") || "-",
        planetary: master.planetary || "-",
        workersLength: item.workers.length,
        billing: undefined,
        wireguard: undefined,
        detailsLoading: false,
      };
    });

    await Promise.allSettled(items.value.map(item => fetchClusterDetails(item)));
  } catch (error) {
    console.error("Error loading deployments:", error);
    items.value = [];
    count.value = 0;
    failedDeployments.value = [];
  } finally {
    loading.value = false;
    const end = performance.now();
    console.log(`Time taken: ${(end - start) / 1000} seconds`);
  }
}

async function fetchClusterDetails(item: any) {
  if (item.detailsLoading || (item.billing !== undefined && item.wireguard !== undefined)) return;
  item.detailsLoading = true;
  try {
    const grid = await getGrid(profileManager.profile!, item.projectName || props.projectName);
    if (!grid) {
      item.detailsLoading = false;
      return;
    }

    const [consumption, wireguardConfig] = await Promise.allSettled([
      grid.contracts.getConsumption({ id: item.masters[0].contractId }),
      grid.networks.getWireGuardConfigs({
        name: item.masters[0].interfaces[0].network,
        ipRange: item.masters[0].interfaces[0].ip,
      }),
    ]);

    item.billing =
      consumption.status === "fulfilled" && consumption.value ? consumption.value.amountBilled : "No Data Available";

    item.wireguard =
      wireguardConfig.status === "fulfilled" && wireguardConfig.value?.[0] ? wireguardConfig.value[0] : undefined;
  } finally {
    item.detailsLoading = false;
  }
}

defineExpose({ loadDeployments });
</script>

<script lang="ts">
import toHumanDate from "@/utils/date";

import AccessDeploymentAlert from "./AccessDeploymentAlert.vue";
import ListTable from "./list_table.vue";

export default {
  name: "K8sDeploymentTable",
  components: {
    ListTable,
    AccessDeploymentAlert,
  },
  data() {
    return {
      sortBy: [{ key: "created", order: "desc" }],
    };
  },
};
</script>
