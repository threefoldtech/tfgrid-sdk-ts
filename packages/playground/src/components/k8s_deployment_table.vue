<template>
  <v-alert v-if="!loading && count && items.length < count" type="warning" variant="tonal">
    Failed to load <strong>{{ count - items.length }}</strong> deployment{{ count - items.length > 1 ? "s" : "" }}.

    <span>
      This might happen because the node is down or it's not reachable
      <span v-if="showEncryption"
        >or the deployment{{ count - items.length > 1 ? "s are" : " is" }} encrypted by another key</span
      >.
    </span>
    <v-icon class="custom-icon" @click="showDialog = true">mdi-file-document-outline </v-icon>

    <v-dialog transition="dialog-bottom-transition" v-model="showDialog" persistent max-width="500px">
      <v-card>
        <v-card-title style="color: #ffcc00; font-weight: bold">Failed Deployments</v-card-title>
        <v-divider color="#FFCC00" />
        <v-card-text>
          <ul>
            <li v-for="deployment in failedDeployments" :key="deployment.name">
              {{
                deployment.nodes.length > 0
                  ? `${deployment.name} on node${deployment.nodes.length > 1 ? "s" : ""}: ${deployment.nodes.join(
                      ", ",
                    )}`
                  : deployment.name
              }}
            </li>
          </ul>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="showDialog = false" class="grey lighten-2 black--text" color="#FFCC00">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-alert>

  <ListTable
    :headers="[
      { title: 'PLACEHOLDER', key: 'data-table-select' },
      { title: 'Name', key: 'name' },
      { title: 'Public IPv4', key: 'ipv4' },
      { title: 'Public IPv6', key: 'ipv6' },
      { title: 'Planetary Network IP', key: 'planetary' },
      { title: 'Workers', key: 'workers' },
      { title: 'Billing Rate', key: 'billing' },
      { title: 'Actions', key: 'actions' },
    ]"
    :items="items"
    :loading="loading"
    :deleting="deleting"
    :model-value="$props.modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :no-data-text="`No Kubernetes deployments found on this account.`"
    @click:row="$attrs['onClick:row']"
  >
    <template #[`item.name`]="{ item }">
      {{ item.value.deploymentName }}
    </template>

    <template #[`item.ipv4`]="{ item }">
      {{ item.value.masters[0].publicIP?.ip?.split("/")?.[0] || item.value.masters[0].publicIP?.ip || "None" }}
    </template>

    <template #[`item.ipv6`]="{ item }">
      {{ item.value.masters[0].publicIP?.ip6 || "None" }}
    </template>

    <template #[`item.planetary`]="{ item }">
      {{ item.value.masters[0].planetary || "None" }}
    </template>

    <template #[`item.workers`]="{ item }">
      {{ item.value.workers.length }}
    </template>

    <template #[`item.billing`]="{ item }">
      {{ item.value.masters[0].billing }}
    </template>

    <template #[`item.actions`]="{ item }">
      <v-chip color="error" variant="tonal" v-if="deleting && ($props.modelValue || []).includes(item.value)">
        Deleting...
      </v-chip>
      <v-btn-group variant="tonal" v-else>
        <slot name="actions" :item="item"></slot>
      </v-btn-group>
    </template>
  </ListTable>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, updateGrid } from "../utils/grid";
import { loadK8s, mergeLoadedDeployments } from "../utils/load_deployment";

const profileManager = useProfileManager();
const showDialog = ref(false);
const showEncryption = ref(false);
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
  items.value = [];
  loading.value = true;
  const grid = await getGrid(profileManager.profile!, props.projectName);
  const chunk1 = await loadK8s(grid!);
  const chunk2 = await loadK8s(updateGrid(grid!, { projectName: props.projectName.toLowerCase() }));
  const chunk3 = await loadK8s(updateGrid(grid!, { projectName: "" }));

  const clusters = mergeLoadedDeployments(chunk1, chunk2, chunk3);
  failedDeployments.value = [
    ...(Array.isArray((chunk1 as any).failedDeployments) ? (chunk1 as any).failedDeployments : []),
    ...(Array.isArray((chunk2 as any).failedDeployments) ? (chunk2 as any).failedDeployments : []),
    ...(Array.isArray((chunk3 as any).failedDeployments) ? (chunk3 as any).failedDeployments : []),
  ];
  count.value = clusters.count;
  items.value = clusters.items;
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
