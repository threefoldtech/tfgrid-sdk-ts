<template>
  <div>
    <v-alert v-if="!loading && count && items.length < count" type="warning" variant="tonal">
      Failed to load <strong>{{ count - items.length }}</strong> deployment{{ count - items.length > 1 ? "s" : "" }}.

      <span>
        This might happen because the node is down or it's not reachable
        <span v-if="showEncryption"
          >or the deployment{{ count - items.length > 1 ? "s are" : " is" }} encrypted by another key</span
        >.
      </span>
      <v-icon class="custom-icon" @click="showDialog = true">mdi-file-document-outline </v-icon>

      <v-dialog transition="dialog-bottom-transition" v-model="showDialog" max-width="500px" scrollable>
        <v-card>
          <v-card-title style="color: #ffcc00; font-weight: bold">Failed Deployments</v-card-title>
          <v-divider color="#FFCC00" />
          <v-card-text>
            <v-list :items="failedDeploymentList" item-props lines="three">
              <template v-slot:subtitle="{ subtitle }">
                <div v-html="subtitle"></div>
              </template>
            </v-list>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn @click="showDialog = false" class="grey lighten-2 black--text" color="#FFCC00">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-alert>

    <ListTable
      :headers="filteredHeaders"
      :items="items"
      :loading="loading"
      :deleting="deleting"
      :model-value="$props.modelValue"
      @update:model-value="$emit('update:model-value', $event)"
      :no-data-text="`No ${projectName} deployments found on this account.`"
      @click:row="$attrs['onClick:row']"
    >
      <template #[`item.name`]="{ item }">
        {{ item.value.name }}
      </template>

      <template #[`item.ipv4`]="{ item }">
        {{ item.value.publicIP?.ip?.split("/")?.[0] || item.value.publicIP?.ip || "-" }}
      </template>

      <template #[`item.ipv6`]="{ item }">
        {{ item.value.publicIP?.ip6 || "-" }}
      </template>

      <template #[`item.planetary`]="{ item }">
        {{ item.value.planetary || "-" }}
      </template>

      <template #[`item.wireguard`]="{ item }">
        {{ item.value.interfaces.ip || "-" }}
      </template>

      <template #[`item.flist`]="{ item }">
        <v-tooltip :text="item.value.flist" location="bottom right">
          <template #activator="{ props }">
            <p v-bind="props">
              {{ item.value.flist.replace("https://hub.grid.tf/", "").replace(".flist", "") }}
            </p>
          </template>
        </v-tooltip>
      </template>

      <template #[`item.billing`]="{ item }">
        {{ item.value.billing }}
      </template>
      <template #[`item.actions`]="{ item }">
        <v-chip color="error" variant="tonal" v-if="deleting && ($props.modelValue || []).includes(item.value)">
          Deleting...
        </v-chip>
        <v-btn-group variant="tonal" v-else>
          <slot :name="projectName + '-actions'" :item="item"></slot>
        </v-btn-group>
      </template>
    </ListTable>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, updateGrid } from "../utils/grid";
import { loadVms, mergeLoadedDeployments } from "../utils/load_deployment";

const profileManager = useProfileManager();

const props = defineProps<{
  projectName: string;
  modelValue: any[];
  deleting: boolean;
}>();
defineEmits<{ (event: "update:model-value", value: any[]): void }>();

const loading = ref(false);
const count = ref<number>();
const items = ref<any[]>([]);
const showDialog = ref(false);
const showEncryption = ref(false);
const failedDeployments = ref<
  {
    name: string;
    nodes?: number[];
    contracts?: { contract_id: number; node_id: number }[];
  }[]
>([]);

onMounted(loadDeployments);

async function loadDeployments() {
  const migrateGateways = props.projectName.toLowerCase() !== "fullvm" && props.projectName.toLowerCase() !== "vm";

  items.value = [];
  loading.value = true;
  const grid = await getGrid(profileManager.profile!, props.projectName);
  const chunk1 = await loadVms(grid!);
  if (chunk1.count > 0 && migrateGateways) {
    await migrateModule(grid!.gateway);
  }

  const chunk2 = await loadVms(updateGrid(grid!, { projectName: props.projectName.toLowerCase() }));
  if (chunk2.count > 0 && migrateGateways) {
    await migrateModule(grid!.gateway);
  }

  const filter =
    props.projectName.toLowerCase() === ProjectName.VM.toLowerCase()
      ? undefined
      : ([vm]: [{ flist: string }]) => vm.flist.replace(/-/g, "").includes(props.projectName.toLowerCase());

  const chunk3 =
    props.projectName.toLowerCase() === ProjectName.Fullvm.toLowerCase()
      ? { count: 0, items: [] }
      : await loadVms(updateGrid(grid!, { projectName: "" }), { filter });
  if (chunk3.count > 0 && migrateGateways) {
    await migrateModule(grid!.gateway);
  }

  const vms = mergeLoadedDeployments(chunk1, chunk2, chunk3 as any);
  failedDeployments.value = [
    ...(Array.isArray((chunk1 as any).failedDeployments) ? (chunk1 as any).failedDeployments : []),
    ...(Array.isArray((chunk2 as any).failedDeployments) ? (chunk2 as any).failedDeployments : []),
    ...(Array.isArray((chunk3 as any).failedDeployments) ? (chunk3 as any).failedDeployments : []),
  ];

  count.value = vms.count;
  items.value = vms.items.flat(1);

  loading.value = false;
}

const filteredHeaders = computed(() => {
  let headers = [
    { title: "PLACEHOLDER", key: "data-table-select" },
    { title: "Name", key: "name" },
    { title: "Public IPv4", key: "ipv4", sortable: false },
    { title: "Public IPv6", key: "ipv6", sortable: false },
    { title: "Planetary Network IP", key: "planetary", sortable: false },
    { title: "WireGuard", key: "wireguard", sortable: false },
    { title: "Flist", key: "flist" },
    { title: "Cost", key: "billing" },
    { title: "Actions", key: "actions", sortable: false },
  ];

  const IPV6Solutions = [ProjectName.VM, ProjectName.Fullvm] as string[];

  const IPV4Solutions = [
    ProjectName.VM,
    ProjectName.Fullvm,
    ProjectName.Presearch,
    ProjectName.Algorand,
    ProjectName.Subsquid,
    ProjectName.Umbrel,
    ProjectName.Nextcloud,
  ] as string[];

  const WireguardSolutions = [ProjectName.VM, ProjectName.Fullvm, ProjectName.Umbrel] as string[];

  const flistSolutions = [ProjectName.VM, ProjectName.Fullvm] as string[];

  if (!IPV6Solutions.includes(props.projectName)) {
    headers = headers.filter(h => h.key !== "ipv6");
  }

  if (!IPV4Solutions.includes(props.projectName)) {
    headers = headers.filter(h => h.key !== "ipv4");
  }

  if (!WireguardSolutions.includes(props.projectName)) {
    headers = headers.filter(h => h.key !== "wireguard");
  }

  if (!flistSolutions.includes(props.projectName)) {
    headers = headers.filter(h => h.key !== "flist");
  }

  return headers;
});

const failedDeploymentList = computed(() => {
  return failedDeployments.value
    .map(({ name, nodes = [], contracts = [] }, index) => {
      const nodeMessage =
        nodes.length > 0
          ? `<span class="ml-4 text-primary font-weight-bold">On Node:</span> ${nodes.join(", ")}.<br/>`
          : "";
      const contractMessage =
        contracts.length > 0
          ? ` <span class="ml-4 text-primary font-weight-bold">With Contract ID:</span> ${contracts
              .map(c => c.contract_id)
              .join(", ")}.`
          : "";

      const subtitle =
        nodeMessage + contractMessage === ""
          ? `<span class="ml-4 text-error font-weight-bold">Error:</span> Failed to decrypt deployment data.`
          : nodeMessage + contractMessage;

      const item: any[] = [{ title: name, subtitle }];

      if (index + 1 !== failedDeployments.value.length) {
        item.push({ type: "divider", inset: false });
      }

      return item;
    })
    .flat(1);
});

defineExpose({ loadDeployments });
</script>

<script lang="ts">
import { ProjectName } from "../types";
import { migrateModule } from "../utils/migration";
import ListTable from "./list_table.vue";

export default {
  name: "VmDeploymentTable",
  components: {
    ListTable,
  },
};
</script>

<style>
.custom-icon {
  float: right;
}
</style>
