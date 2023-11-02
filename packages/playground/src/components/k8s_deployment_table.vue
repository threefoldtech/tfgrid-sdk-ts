<template>
  <div>
    <v-alert v-if="!loading && count && items.length < count" type="warning" variant="tonal">
      Failed to load deployment{{ count - items.length > 1 ? "s" : "" }} with name{{
        count - items.length > 1 ? "s" : ""
      }}
      <strong>{{ namesOfFailedDeployments }}</strong
      >.
    </v-alert>

    <ListTable
      :headers="[
        { title: 'PLACEHOLDER', key: 'data-table-select' },
        { title: 'Name', key: 'name' },
        { title: 'Public IPv4', key: 'ipv4', sortable: false },
        { title: 'Public IPv6', key: 'ipv6', sortable: false },
        { title: 'Planetary Network IP', key: 'planetary', sortable: false },
        { title: 'Workers', key: 'workers' },
        { title: 'Billing Rate', key: 'billing' },
        { title: 'Actions', key: 'actions', sortable: false },
      ]"
      :items="items"
      :loading="loading"
      :deleting="deleting"
      :model-value="$props.modelValue"
      @update:model-value="$emit('update:model-value', $event)"
      :no-data-text="`No Kubernetes deployments found on this account.`"
      @click:row="$attrs['onClick:row']"
    >
      <template #[`item.actions`]="{ item }">
        <v-chip color="error" variant="tonal" v-if="deleting && ($props.modelValue || []).includes(item.value)">
          Deleting...
        </v-chip>
        <v-btn-group variant="tonal" v-else>
          <slot name="actions" :item="item"></slot>
        </v-btn-group>
      </template>
    </ListTable>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, updateGrid } from "../utils/grid";
import { loadK8s, mergeLoadedDeployments } from "../utils/load_deployment";

const profileManager = useProfileManager();

const props = defineProps<{
  projectName: string;
  modelValue: any[];
  deleting: boolean;
}>();
defineEmits<{ (event: "update:model-value", value: any[]): void }>();

const count = ref<number>();
const items = ref<any[]>([]);
const loading = ref(false);
const namesOfFailedDeployments = ref("");

onMounted(loadDeployments);
async function loadDeployments() {
  items.value = [];
  loading.value = true;
  const grid = await getGrid(profileManager.profile!, props.projectName);
  const chunk1 = await loadK8s(grid!);
  const chunk2 = await loadK8s(updateGrid(grid!, { projectName: props.projectName.toLowerCase() }));
  const chunk3 = await loadK8s(updateGrid(grid!, { projectName: "" }));

  const clusters = mergeLoadedDeployments(chunk1, chunk2, chunk3);
  const failedDeployments = [
    ...((chunk1 as any).failedK8s ?? []),
    ...((chunk2 as any).failedK8s ?? []),
    ...((chunk3 as any).failedK8s ?? []),
  ];
  namesOfFailedDeployments.value = failedDeployments.join(", ");

  count.value = clusters.count;
  items.value = clusters.items.map((item: any) => {
    item.name = item.deploymentName;
    item.ipv4 = item.masters[0].publicIP?.ip?.split("/")?.[0] || item.masters[0].publicIP?.ip || "None";
    item.ipv6 = item.masters[0].publicIP?.ip6 || "None";
    item.planetary = item.masters[0].planetary || "None";
    item.workers = item.workers.length;
    item.billing = item.masters[0].billing;
    return item;
  });
  loading.value = false;
}

defineExpose({ loadDeployments });
</script>

<script lang="ts">
import ListTable from "./list_table.vue";

export default {
  name: "K8sDeploymentTable",
  components: {
    ListTable,
  },
};
</script>
