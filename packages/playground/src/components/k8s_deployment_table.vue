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
      <v-tooltip location="top" text="Show failed deployments">
        <template #activator="{ props }">
          <v-icon v-bind="props" class="custom-icon" @click="showDialog = true"
            >mdi-file-document-refresh-outline
          </v-icon>
        </template>
      </v-tooltip>

      <v-dialog transition="dialog-bottom-transition" v-model="showDialog" attach="#modals">
        <v-card>
          <v-card-title style="color: #ffcc00; font-weight: bold">Failed Deployments</v-card-title>
          <v-divider color="#FFCC00" />
          <v-card-text>
            <v-alert type="error" variant="tonal">
              Failed to load
              <strong>{{ count - items.length }}</strong> deployment{{ count - items.length > 1 ? "s" : "" }}.

              <span>
                This might happen because the node is down or it's not reachable
                <span v-if="showEncryption"
                  >or the deployment{{ count - items.length > 1 ? "s are" : " is" }} encrypted by another key</span
                >.
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
            <v-btn @click="showDialog = false" color="anchor">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-alert>

    <AccessDeploymentAlert />

    <InputTooltip tooltip="Didn't find your deployments in the list? Enable to show all deployments." inline>
      <VSwitch
        inset
        color="primary"
        label="Show All Deployments"
        @update:model-value="loadDeployments"
        v-model="showAllDeployments"
      />
    </InputTooltip>

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
      @update:model-value="$emit('update:model-value', $event)"
      @click:row="$attrs['onClick:row']"
      :sort-by="sortBy"
    >
      <template #[`item.created`]="{ item }">
        {{ toHumanDate(item.masters[0].created) }}
      </template>

      <template #[`item.mycelium`]="{ item }">
        {{ item.masters[0].myceliumIP || "-" }}
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getNodeHealthColor(item.masters[0].status as string).color">
          <v-tooltip v-if="item.masters[0].status == NodeHealth.Error" activator="parent" location="top">{{
            item.masters[0].message
          }}</v-tooltip>
          <v-tooltip v-if="item.masters[0].status == NodeHealth.Paused" activator="parent" location="top"
            >The deployment contract is in grace period</v-tooltip
          >
          <span class="text-uppercase">
            {{ getNodeHealthColor(item.masters[0].status as string).type }}
          </span>
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-chip color="error" v-if="deleting && ($props.modelValue || []).includes(item.value)"> Deleting... </v-chip>
        <v-btn-group variant="tonal" v-else>
          <slot name="actions" :item="item"></slot>
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
import { type K8S, type LoadedDeployments, loadK8s, mergeLoadedDeployments } from "../utils/load_deployment";
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
  items.value = [];
  loading.value = true;
  const grid = await getGrid(profileManager.profile!, props.projectName);
  const chunk1 = await loadK8s(grid!);
  const chunk2 = await loadK8s(updateGrid(grid!, { projectName: props.projectName.toLowerCase() }));
  let chunk3: LoadedDeployments<K8S> = { count: 0, items: [], failedDeployments: [] };

  if (showAllDeployments.value) {
    chunk3 = await loadK8s(updateGrid(grid!, { projectName: "" }));
    chunk3.items = chunk3.items.map(i => {
      return !i.projectName || i.projectName === "Kubernetes" ? markAsFromAnotherClient(i) : i;
    });
  }

  const clusters = mergeLoadedDeployments(chunk1, chunk2, chunk3);
  failedDeployments.value = clusters.failedDeployments;

  count.value = clusters.count;
  items.value = clusters.items.map((item: any) => {
    item.name = item.deploymentName;
    item.ipv4 = item.masters[0].publicIP?.ip?.split("/")?.[0] || item.masters[0].publicIP?.ip || "-";
    item.ipv6 = item.masters[0].publicIP?.ip6.replace(/\/64$/, "") || "-";
    item.planetary = item.masters[0].planetary || "-";
    item.workersLength = item.workers.length;
    item.billing = item.masters[0].billing;
    item.created = item.masters[0].created;
    return item;
  });
  loading.value = false;
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
      sortBy: [
        { key: "name", order: "asc" },
        { key: "workersLength", order: "asc" },
        { key: "billing", order: "asc" },
        { key: "created", order: "asc" },
      ],
    };
  },
};
</script>
