<template>
  <div>
    <v-alert v-if="!loading && count && items.length < count" type="warning" variant="tonal">
      Failed to load deployment{{ count - items.length > 1 ? "s" : "" }} with name{{
        count - items.length > 1 ? "s" : ""
      }}
      <strong>{{ namesOfFailedDeployments }}</strong
      >.
      <span>
        This might happen because the node is down or it's not reachable or the deployment{{
          count - items.length > 1 ? "s are" : " is"
        }}
        encrypted by another key.
      </span>
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
        {{ item.value[0].name }}
      </template>

      <template #[`item.ipv4`]="{ item }">
        {{ item.value[0].publicIP?.ip?.split("/")?.[0] || item.value[0].publicIP?.ip || "-" }}
      </template>

      <template #[`item.ipv6`]="{ item }">
        {{ item.value[0].publicIP?.ip6 || "-" }}
      </template>

      <template #[`item.planetary`]="{ item }">
        {{ item.value[0].planetary || "-" }}
      </template>

      <template #[`item.wireguard`]="{ item }">
        {{ item.value[0].interfaces[0].ip || "-" }}
      </template>

      <template #[`item.flist`]="{ item }">
        <v-tooltip :text="item.value[0].flist" location="bottom right">
          <template #activator="{ props }">
            <p v-bind="props">
              {{ item.value[0].flist.replace("https://hub.grid.tf/", "").replace(".flist", "") }}
            </p>
          </template>
        </v-tooltip>
      </template>

      <template #[`item.billing`]="{ item }">
        {{ item.value[0].billing }}
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
const namesOfFailedDeployments = ref("");

onMounted(loadDeployments);
async function loadDeployments() {
  items.value = [];
  loading.value = true;
  const grid = await getGrid(profileManager.profile!, props.projectName);
  const chunk1 = await loadVms(grid!);
  if (chunk1.count > 0) await grid!.gateway.list();

  const chunk2 = await loadVms(updateGrid(grid!, { projectName: props.projectName.toLowerCase() }));
  if (chunk2.count > 0) await grid!.gateway.list();

  const filter =
    props.projectName === ProjectName.VM
      ? undefined
      : ([vm]: [{ flist: string }]) => vm.flist.replace(/-/g, "").includes(props.projectName.toLowerCase());

  const chunk3 =
    props.projectName === ProjectName.Fullvm
      ? { count: 0, items: [] }
      : await loadVms(updateGrid(grid!, { projectName: "" }), { filter });
  if (chunk3.count > 0) await grid!.gateway.list();

  const vms = mergeLoadedDeployments(chunk1, chunk2, chunk3 as any);
  const failedDeployments = [
    ...(chunk1 as any).failedDeployments,
    ...(chunk2 as any).failedDeployments,
    ...(chunk3 as any).failedDeployments,
  ];
  namesOfFailedDeployments.value = failedDeployments.join(", ");

  count.value = vms.count;
  items.value = vms.items;

  loading.value = false;
}

const filteredHeaders = computed(() => {
  let headers = [
    { title: "PLACEHOLDER", key: "data-table-select" },
    { title: "Name", key: "name" },
    { title: "Public IPv4", key: "ipv4" },
    { title: "Public IPv6", key: "ipv6" },
    { title: "Planetary Network IP", key: "planetary" },
    { title: "WireGuard", key: "wireguard" },
    { title: "Flist", key: "flist" },
    { title: "Cost", key: "billing" },
    { title: "Actions", key: "actions" },
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

defineExpose({ loadDeployments });
</script>

<script lang="ts">
import { ProjectName } from "../types";
import ListTable from "./list_table.vue";

export default {
  name: "VmDeploymentTable",
  components: {
    ListTable,
  },
};
</script>
