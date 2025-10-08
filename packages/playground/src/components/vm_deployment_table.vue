<template>
  <div>
    <v-alert v-if="errorMessage" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="!loading && count && items.length < count" type="error" variant="tonal">
      Failed to load <strong>{{ count - items.length }}</strong> deployment{{ count - items.length > 1 ? "s" : "" }}.

      <span>
        This might happen because the node is down or it's not reachable
        <span v-if="showEncryption">or the deployment{{ count - items.length > 1 ? "s are" : " is" }} encrypted by another key</span>.
      </span>
      <v-tooltip location="top" text="Show failed deployments">
        <template #activator="{ props: slotProps }">
          <v-icon v-bind="slotProps" class="custom-icon" @click="showDialog = true">
            mdi-file-document-refresh-outline
          </v-icon>
        </template>
      </v-tooltip>

      <v-dialog v-model="showDialog" transition="dialog-bottom-transition" scrollable attach="#modals">
        <v-card>
          <v-card-title style="font-weight: bold"> Failed Deployments Details </v-card-title>
          <v-divider color="#FFCC00" />
          <v-card-text>
            <v-data-table
              :headers="failedDeploymentsHeader"
              :items="failedDeploymentList"
              :items-per-page-options="
                failedDeploymentList.length > 5
                  ? [
                      { value: 5, title: '5' },
                      { value: 10, title: '10' },
                      { value: 20, title: '20' },
                      { value: 50, title: '50' },
                    ]
                  : undefined
              "
              :hide-default-footer="failedDeploymentList.length <= 5"
              class="mt-3"
              hover
            ></v-data-table>
          </v-card-text>
          <v-card-actions class="justify-end my-1 mr-2">
            <v-btn color="anchor" @click="showDialog = false"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-alert>

    <AccessDeploymentAlert v-if="!hideSsh" />

    <div
      class="d-flex flex-column flex-sm-row"
      :class="[props.projectName.toLowerCase() === 'vm' ? 'justify-sm-space-between' : 'flex-sm-row-reverse']"
    >
      <InputTooltip
        v-if="props.projectName.toLowerCase() === 'vm'"
        tooltip="Didn't find your deployments in the list? Enable to show all deployments."
        inline
      >
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
      :headers="filteredHeaders"
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
      <template #[`item.name`]="{ item }">
        {{ item.name }}
      </template>

      <template #[`item.ipv4`]="{ item }">
        {{ item.publicIP?.ip?.split("/")?.[0] || item.publicIP?.ip || "-" }}
      </template>

      <template #[`item.mycelium`]="{ item }">
        {{ item.myceliumIP || "-" }}
      </template>

      <template #[`item.flist`]="{ item }">
        <v-tooltip :text="item.flist" location="bottom right">
          <template #activator="{ props: slotProps }">
            <p v-bind="slotProps">
              {{ renameFlist(item.flist) }}
            </p>
          </template>
        </v-tooltip>
      </template>

      <template #[`item.billing`]="{ item }">
        {{ item.billing || "No Data Available" }}
      </template>
      <template #[`item.created`]="{ item }">
        {{ toHumanDate(item.created) }}
      </template>
      <template #[`item.actions`]="{ item }">
        <v-chip v-if="deleting && ($props.modelValue || []).includes(item)" color="error"> Deleting... </v-chip>
        <v-btn-group v-else variant="tonal">
          <slot :name="projectName + '-actions'" :item="item" :update="updateItem" />
        </v-btn-group>
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getNodeHealthColor(item.status as string).color">
          <v-tooltip v-if="item.status == NodeHealth.Error" activator="parent" location="top">
            {{ item.message }}
          </v-tooltip>
          <v-tooltip v-if="item.status == NodeHealth.Paused" activator="parent" location="top">
            The deployment contract is in grace period
          </v-tooltip>
          <span class="text-uppercase">
            {{ getNodeHealthColor(item.status as string).type }}
          </span>
        </v-chip>
      </template>
      <template #[`item.health`]="{ item }">
        <v-chip :color="getNodeHealthColor(item[0].workloads[0].result.state as string).color">
          <v-tooltip v-if="item[0].workloads[0].result.state == NodeHealth.Error" activator="parent" location="top">
            {{ item.message }}
          </v-tooltip>
          <v-tooltip v-if="item[0].workloads[0].result.state == NodeHealth.Paused" activator="parent" location="top">
            The deployment contract is in grace period
          </v-tooltip>
          <span class="text-uppercase">
            {{ getNodeHealthColor(item[0].workloads[0].result.state as string).type }}
          </span>
        </v-chip>
      </template>

      <template #no-data-text>
        <div v-if="failedDeploymentList.length > 0" class="text-center">
          <p v-text="'Couldn\'t load any of your ' + projectTitle + ' deployments.'" />
          <VBtn
            class="mt-4"
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-reload"
            text="Reload"
            @click="loadDeployments"
          />
        </div>
        <p v-else v-text="'No ' + projectTitle + ' deployments found on this account.'" />
      </template>
    </ListTable>
  </div>
</template>

<script lang="ts" setup>
import { capitalize, computed, onMounted, ref } from "vue";
import type { GridClient } from "@threefold/grid_client";

import { getNodeHealthColor, NodeHealth } from "@/utils/get_nodes";

import { useGrid } from "../stores";
import { markAsFromAnotherClient } from "../utils/helpers";
import { loadVms, mergeLoadedDeployments, getGridClient } from "../utils/load_deployment";

const props = defineProps<{
  projectName: string;
  projectTitle: string;
  modelValue: any[];
  deleting: boolean;
  hideSsh?: boolean;
}>();
defineEmits<{ (event: "update:model-value", value: any[]): void }>();

const loading = ref(false);
const count = ref<number>();
const items = ref<any[]>([]);
const showDialog = ref(false);
const showEncryption = ref(false);
const errorMessage = ref<string>("");
const showAllDeployments = ref(false);
const failedDeployments = ref<
  {
    name: string;
    nodes?: number[];
    contracts?: { contractID: number; node_id: number }[];
  }[]
>([]);
const gridStore = useGrid();
const grid = gridStore.client as GridClient;
const failedDeploymentsHeader = ref([
  { title: "Name", key: "name", sortable: false },
  { title: "Node ID", key: "nodes", sortable: false },
  { title: "Contract ID", key: "contracts", sortable: false },
]);
onMounted(loadDeployments);

async function loadDomains() {
  try {
    loading.value = true;
    const grid = await getGridClient(gridStore.client.clientOptions, props.projectName.toLowerCase());
    const gateways = await grid!.gateway.list();
    const gwsResults = await Promise.allSettled(gateways.map(name => grid!.gateway.get_name({ name })));
    const gws = gwsResults
      .filter(result => result.status === "fulfilled")
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const failedGateways = gwsResults
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === "rejected")
      .map(({ result, index }) => ({
        name: gateways[index],
        reason: (result as PromiseRejectedResult).reason,
      }));

    if (failedGateways.length > 0) {
      console.error("Failed to load some gateway deployments:", failedGateways);

      count.value = gateways.length;
      failedDeployments.value = failedGateways.map(fg => ({
        name: fg.name,
        error: fg.reason?.message || fg.reason || "Unknown error",
      }));
    }

    items.value = gws.map(gw => {
      (gw as any).name = gw[0].workloads[0].name;
      return gw;
    });
  } catch (e) {
    errorMessage.value = `Failed to load Deployments: ${e}`;
  } finally {
    loading.value = false;
  }
}

async function loadDeploymentChunks(grid: GridClient, projectName: string, showAll: boolean) {
  const loadTasks = [loadVms(grid), loadVms(await getGridClient(grid.clientOptions, projectName.toLowerCase()))];

  // Only load all deployments for VM projects when showAll is enabled
  const shouldLoadAllDeployments = showAll && projectName.toLowerCase() === ProjectName.VM.toLowerCase();
  if (shouldLoadAllDeployments) {
    loadTasks.push(loadVms(await getGridClient(grid.clientOptions, "")));
  } else {
    // Add a resolved promise to maintain consistent array length
    loadTasks.push(Promise.resolve({ count: 0, items: [], failedDeployments: [] }));
  }

  return Promise.allSettled(loadTasks);
}

async function loadDeployments() {
  const start = performance.now();
  if (props.projectName.toLowerCase() === ProjectName.Domains.toLowerCase()) {
    return loadDomains();
  }

  const migrateGateways = props.projectName.toLowerCase() !== "fullvm" && props.projectName.toLowerCase() !== "vm";

  items.value = [];
  loading.value = true;
  try {
    const results = await loadDeploymentChunks(grid!, props.projectName, showAllDeployments.value);
    const [chunk1, chunk2, chunk3] = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.error(`Failed to load VM chunk ${index + 1}:`, result.reason);
        return { count: 0, items: [], failedDeployments: [] };
      }
    });

    if (migrateGateways) {
      const hasDeployments = chunk1.count > 0 || chunk2.count > 0 || chunk3.count > 0;
      if (hasDeployments) {
        await migrateModule(grid!.gateway);
      }
    }

    if (chunk3.items) {
      chunk3.items = chunk3.items.map(markAsFromAnotherClient);
    }

    const vms = mergeLoadedDeployments(chunk1, chunk2, chunk3 as any);
    failedDeployments.value = vms.failedDeployments;
    count.value = vms.count;
    items.value = mergeCaproverDeployments(vms.items);
  } catch (err) {
    errorMessage.value = `Failed to load Deployments: ${err}`;
  } finally {
    loading.value = false;
  }
  const end = performance.now();
  console.log(`Time taken: ${(end - start) / 1000} seconds`);
}

const filteredHeaders = computed(() => {
  if (props.projectName.toLowerCase() === ProjectName.Domains.toLowerCase()) {
    return [
      {
        title: "Name",
        key: "domain-name",
        value(item: any) {
          const [workload] = item[0].workloads;
          return workload.data.name || workload.name;
        },
      },
      {
        title: "Backends",
        key: "backends",
        value(item: any) {
          return item[0].workloads[0].data.backends.join(", ");
        },
        sortable: false,
      },
      {
        title: "Domain",
        key: "fqdn",
        value(item: any) {
          const [workload] = item[0].workloads;
          return workload.result.data.fqdn || workload.data.fqdn;
        },
      },
      {
        title: "Health",
        key: "health",
        value(item: any) {
          return capitalize(item[0].workloads[0].result.state);
        },
        sortable: false,
      },
      { title: "Actions", key: "actions", sortable: false },
    ];
  }

  let headers = [
    { title: "PLACEHOLDER", key: "data-table-select" },
    { title: "Name", key: "name" },
    {
      title: "Networks",
      key: "networks",
      sortable: false,
      children: [
        { title: "Public IPv4", key: "ipv4", sortable: false },
        { title: "Mycelium IP", key: "mycelium", sortable: false },
      ],
    },
    { title: "Image", key: "flist" },
    { title: "Cost", key: "billing" },
    { title: "Created At", key: "created" },
    { title: "Health", key: "status", sortable: false },
    { title: "Actions", key: "actions", sortable: false },
  ];

  const IPV6Solutions = [
    ProjectName.NodePilot,
    ProjectName.VM,
    ProjectName.Fullvm,
    ProjectName.Presearch,
    ProjectName.Umbrel,
    ProjectName.Nextcloud,
    ProjectName.Openwebui,
    ProjectName.Funkwhale,
    ProjectName.Casperlabs,
    ProjectName.Mattermost,
    ProjectName.Discourse,
    ProjectName.Taiga,
    ProjectName.StaticWebsite,
    ProjectName.Wordpress,
    ProjectName.TFRobot,
    ProjectName.Gitea,
    ProjectName.Nostr,
    ProjectName.Algorand,
    ProjectName.Subsquid,
    ProjectName.Peertube,
    ProjectName.Jenkins,
    ProjectName.Jitsi,
  ] as string[];

  const IPV4Solutions = [
    ProjectName.NodePilot,
    ProjectName.VM,
    ProjectName.Fullvm,
    ProjectName.Presearch,
    ProjectName.Umbrel,
    ProjectName.Nextcloud,
    ProjectName.Funkwhale,
    ProjectName.Casperlabs,
    ProjectName.Mattermost,
    ProjectName.Discourse,
    ProjectName.Taiga,
    ProjectName.StaticWebsite,
    ProjectName.Wordpress,
    ProjectName.TFRobot,
    ProjectName.Gitea,
    ProjectName.Nostr,
    ProjectName.Algorand,
    ProjectName.Subsquid,
    ProjectName.Peertube,
    ProjectName.Jenkins,
    ProjectName.Caprover,
    ProjectName.Jitsi,
  ] as string[];

  const WireguardSolutions = [ProjectName.VM, ProjectName.Fullvm, ProjectName.Umbrel, ProjectName.TFRobot] as string[];

  const flistSolutions = [ProjectName.VM, ProjectName.Fullvm] as string[];

  if (headers[2].children) {
    if (!IPV6Solutions.includes(props.projectName)) {
      headers[2].children = headers[2].children.filter(h => h.key !== "ipv6");
    }

    if (!IPV4Solutions.includes(props.projectName)) {
      headers[2].children = headers[2].children.filter(h => h.key !== "ipv4");
    }

    if (!WireguardSolutions.includes(props.projectName)) {
      headers[2].children = headers[2].children.filter(h => h.key !== "wireguard");
    }
  }
  if (!flistSolutions.includes(props.projectName)) {
    headers = headers.filter(h => h.key !== "flist");
  }

  return headers;
});

const failedDeploymentList = computed(() => {
  return failedDeployments.value.map(({ name, nodes = [], contracts = [] }) => {
    if (nodes.length === 0 && contracts.length === 0) {
      showEncryption.value = true;
    }

    return {
      name,
      nodes: nodes.length > 0 ? nodes.join(", ") : "N/A",
      contracts: contracts.length > 0 ? contracts.map(c => c.contractID).join(", ") : "N/A",
    };
  });
});

function updateItem(newItem: any) {
  const index = items.value.findIndex(i => i.contractId === newItem.contractId);
  if (index > -1) {
    items.value[index] = newItem;
  }
}

function renameFlist(url: string) {
  const flist = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));

  return flist.length > 40 ? flist.substring(0, 40) + "..." : flist;
}

defineExpose({ loadDeployments });
</script>

<script lang="ts">
import toHumanDate from "@/utils/date";
import { mergeCaproverDeployments } from "@/utils/deploy_helpers";

import { ProjectName } from "../types";
import { migrateModule } from "../utils/migration";
import AccessDeploymentAlert from "./AccessDeploymentAlert.vue";
import ListTable from "./list_table.vue";

export default {
  name: "VmDeploymentTable",
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

<style>
.custom-icon {
  float: right;
}
</style>
