<template>
  <weblet-layout ref="layout">
    <template #title>
      {{ title || "Deployment List" }}
    </template>
    <template #subtitle v-if="!$props.projectName"> List your own deployments for different solutions </template>
    <d-tabs
      :tabs="tabs"
      :model-value="activeTab"
      @update:model-value="activeTab = $event"
      :disabled="deleting"
      destroy
      :hide-tabs="!!$props.projectName"
    >
      <VmDeploymentTable
        :projectName="tabs[activeTab].value"
        v-model="selectedItems"
        :deleting="deleting"
        ref="table"
        @click:row="clickOpenDialog"
      >
        <template #Fullvm-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
        </template>

        <template #VM-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
        </template>

        <template #CapRover-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Admin Panel"
            color="anchor"
            icon="mdi-view-dashboard"
            :href="'http://captain.' + item.value[0].env.CAPROVER_ROOT_DOMAIN"
          />
          <IconActionBtn icon="mdi-cog" tooltip="Manage Workers" @click="dialog = item.value.deploymentName" />

          <ManageCaproverWorkerDialog
            v-if="dialog === item.value.deploymentName"
            :master="item.value[0]"
            :data="item.value.slice(1)"
            @close="dialog = undefined"
            @update:caprover="item.value = $event"
          />
        </template>

        <template #Peertube-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.PEERTUBE_WEBSERVER_HOSTNAME"
          />
        </template>

        <template #Funkwhale-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.FUNKWHALE_HOSTNAME"
          />
        </template>

        <template #Taiga-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Admin Panel"
            color="anchor"
            icon="mdi-view-dashboard"
            :href="'http://' + item.value[0].env.DOMAIN_NAME + '/admin/'"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.DOMAIN_NAME"
          />
        </template>

        <template #Presearch-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
        </template>

        <template #Mattermost-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn tooltip="Visit" color="anchor" icon="mdi-web" :href="item.value[0].env.SITE_URL" />
        </template>

        <template #Discourse-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.DISCOURSE_HOSTNAME"
          />
        </template>

        <template #Freeflow-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.DIGITALTWIN_APPID"
          />
        </template>

        <template #Casperlabs-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.CASPERLABS_HOSTNAME"
          />
        </template>

        <template #Owncloud-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.OWNCLOUD_DOMAIN"
          />
        </template>

        <template #Nextcloud-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Open Nextcloud"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.NEXTCLOUD_DOMAIN + ':8443'"
          />
        </template>

        <template #Subsquid-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="'https://' + item.value[0].env.SUBSQUID_WEBSERVER_HOSTNAME + '/graphql'"
          />
        </template>

        <template #Algorand-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
        </template>

        <template #NodePilot-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Visit"
            icon="mdi-web"
            color="anchor"
            :href="
              'http://' +
              (item.value[0].publicIP?.ip
                ? item.value[0].publicIP.ip.slice(0, -3)
                : '[' + item.value[0].planetary + ']')
            "
          />
        </template>

        <template #Umbrel-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn
            tooltip="Admin Panel"
            color="anchor"
            icon="mdi-view-dashboard"
            :href="
              'http://' +
              (item.value[0].publicIP?.ip
                ? item.value[0].publicIP.ip.slice(0, -3)
                : '[' + item.value[0].planetary + ']')
            "
          />
        </template>

        <template #Wordpress-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-eye-outline"
            @click="openDialog(tabs[activeTab].value, item)"
          />
          <IconActionBtn tooltip="Visit" color="anchor" icon="mdi-web" :href="'https://' + item.value[0].env.WP_URL" />
          <IconActionBtn
            tooltip="Admin Panel"
            color="anchor"
            icon="mdi-view-dashboard"
            :href="'https://' + item.value[0].env.WP_URL + '/wp-admin'"
          />
        </template>
      </VmDeploymentTable>

      <template #Kubernetes>
        <K8sDeploymentTable
          :projectName="tabs[activeTab].value"
          v-model="selectedItems"
          :deleting="deleting"
          ref="table"
          @click:row="clickOpenDialog"
        >
          <template #actions="{ item }">
            <IconActionBtn
              tooltip="Show Details"
              icon="mdi-eye-outline"
              @click="openDialog(tabs[activeTab].value, item)"
            />
            <IconActionBtn icon="mdi-cog" tooltip="Manage Workers" @click="dialog = item.value.deploymentName" />

            <ManageK8SWorkerDialog
              v-if="dialog === item.value.deploymentName"
              :data="item.value"
              @close="dialog = undefined"
              @update:k8s="item.value.workers = $event.workers"
            />
          </template>
        </K8sDeploymentTable>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn
        color="error"
        variant="outlined"
        :disabled="selectedItems.length === 0 || deleting"
        prepend-icon="mdi-delete"
        @click="deletingDialog = true"
      >
        Delete
      </v-btn>
    </template>
  </weblet-layout>

  <v-dialog v-model="deletingDialog" scrollable width="50%">
    <v-card>
      <v-card-title>
        <strong>Are you sure you want to delete the following deployments?</strong>
      </v-card-title>
      <v-card-text>
        <v-chip class="ma-1" color="primary" v-for="item in selectedItems" :key="item.deploymentName">
          {{ item.deploymentName }}
        </v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="outlined" @click="onDelete(tabs[activeTab].value.toLowerCase() === 'kubernetes')">
          Delete
        </v-btn>
        <v-btn color="error" variant="tonal" @click="deletingDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onUnmounted, type Ref, ref, watch } from "vue";

import type { Tab } from "../components/dynamic_tabs.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { deploymentListEnvironments } from "../constants/deployment_list";
import { useProfileManager } from "../stores";
import { deleteDeployment } from "../utils/delete_deployment";
import { getGrid, updateGrid } from "../utils/grid";
const props = defineProps<{
  projectName?: ProjectName;
  title?: string;
}>();

const tabs: Tab[] = [
  { title: "Full Virtual Machine", value: "Fullvm", imgPath: "images/icons/vm.png" },
  { title: "Micro Virtual Machine", value: "VM", imgPath: "images/icons/vm.png" },
  { title: "Kubernetes", value: "Kubernetes", imgPath: "images/icons/kubernetes.png" },
  { title: "CapRover", value: "CapRover", imgPath: "images/icons/caprover.png" },
  { title: "Peertube", value: "Peertube", imgPath: "images/icons/peertube.png" },
  { title: "Funkwhale", value: "Funkwhale", imgPath: "images/icons/funkwhale.png" },
  { title: "Mattermost", value: "Mattermost", imgPath: "images/icons/mattermost.png" },
  { title: "Discourse", value: "Discourse", imgPath: "images/icons/discourse.png" },
  { title: "Taiga", value: "Taiga", imgPath: "images/icons/taiga.png" },
  { title: "Owncloud", value: "Owncloud", imgPath: "images/icons/owncloud.png" },
  { title: "Nextcloud", value: "Nextcloud", imgPath: "images/icons/nextcloud.png" },
  { title: "Presearch", value: "Presearch", imgPath: "images/icons/presearch.png" },
  { title: "Subsquid", value: "Subsquid", imgPath: "images/icons/subsquid.png" },
  { title: "Casperlabs", value: "Casperlabs", imgPath: "images/icons/casperlabs.png" },
  { title: "Algorand", value: "Algorand", imgPath: "images/icons/algorand.png" },
  { title: "Node Pilot", value: "NodePilot", imgPath: "images/icons/vm.png" },
  { title: "Umbrel", value: "Umbrel", imgPath: "images/icons/umbrel.png" },
  { title: "Freeflow", value: "Freeflow", imgPath: "images/icons/freeflow.png" },
  { title: "Wordpress", value: "Wordpress", imgPath: "images/icons/wordpress.png" },
];

const profileManager = useProfileManager();

const layout = useLayout();
const dialog = ref<string>();
const selectedItems = ref<any[]>([]);
const deleting = ref(false);
const deletingDialog = ref(false);
const table = ref() as Ref<{ loadDeployments(): void }>;

const _idx = tabs.findIndex(t => t.value === props.projectName);
const activeTab = ref(!props.projectName ? 0 : _idx) as Ref<number>;
watch(activeTab, () => (selectedItems.value = []));

async function onDelete(k8s = false) {
  deletingDialog.value = false;
  deleting.value = true;
  const grid = await getGrid(profileManager.profile!);
  for (const item of selectedItems.value) {
    try {
      await deleteDeployment(updateGrid(grid!, { projectName: item.projectName }), {
        name: item.deploymentName,
        projectName: item.projectName,
        k8s,
      });
    } catch (e: any) {
      console.log("Error while deleting deployment", e.message);
    }
  }

  selectedItems.value = [];
  table.value?.loadDeployments();
  deleting.value = false;
}

const VMS: string[] = [ProjectName.Fullvm, ProjectName.VM, ProjectName.NodePilot];
function openDialog(project: string, item?: { value: any }): void {
  const key: keyof typeof deploymentListEnvironments = VMS.includes(project)
    ? "vm"
    : project === ProjectName.Kubernetes
    ? "k8s"
    : (project.toLowerCase() as any);
  layout.value.openDialog(item?.value, deploymentListEnvironments[key]);
}

function clickOpenDialog(_: MouseEvent, { item }: any) {
  return openDialog(tabs[activeTab.value].value, item);
}

/* List Manager */
const { uid } = getCurrentInstance() as { uid: number };
const deploymentListManager = useDeploymentListManager();

deploymentListManager?.register(uid, () => {
  return table.value?.loadDeployments;
});

onUnmounted(() => deploymentListManager?.unregister(uid));
</script>

<script lang="ts">
import { useDeploymentListManager } from "../components/deployment_list_manager.vue";
import IconActionBtn from "../components/icon_action_btn.vue";
import K8sDeploymentTable from "../components/k8s_deployment_table.vue";
import ManageCaproverWorkerDialog from "../components/manage_caprover_worker_dialog.vue";
import ManageK8SWorkerDialog from "../components/manage_k8s_worker_dialog.vue";
import VmDeploymentTable from "../components/vm_deployment_table.vue";
import { ProjectName } from "../types";

export default {
  name: "TfDeploymentList",
  components: {
    VmDeploymentTable,
    IconActionBtn,
    K8sDeploymentTable,
    ManageK8SWorkerDialog,
    ManageCaproverWorkerDialog,
  },
};
</script>
