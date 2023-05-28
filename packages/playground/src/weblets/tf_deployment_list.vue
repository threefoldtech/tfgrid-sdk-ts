<template>
  <weblet-layout ref="layout">
    <template #title>
      Deployment List
      {{
        $props.projectName
          ? "(" + (tabs.find(tab => tab.value === $props.projectName)?.title ?? $props.projectName) + ")"
          : ""
      }}
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
      <VmDeploymentTable :projectName="tabs[activeTab].value" v-model="selectedItems" :deleting="deleting" ref="table">
        <template #Fullvm-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
              })
            "
          />
        </template>

        <template #VM-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
              })
            "
          />
        </template>

        <template #CapRover-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SWM_NODE_MODE: 'Swarm Node Mode',
                PUBLIC_KEY: 'Public SSH Key',
                CAPROVER_ROOT_DOMAIN: false,
                CAPTAIN_IMAGE_VERSION: 'Captain Image Version',
                DEFAULT_PASSWORD: 'Default Password',
                CAPTAIN_IS_DEBUG: 'Debug Mode',
              })
            "
          />
          <IconActionBtn
            tooltip="Admin Panel"
            color="info"
            icon="mdi-view-dashboard"
            :href="'http://captain.' + item.value[0].env.CAPROVER_ROOT_DOMAIN"
          />
          <IconActionBtn
            icon="mdi-cog"
            tooltip="Manage Workers"
            color="secondary"
            @click="dialog = item.value.deploymentName"
          />

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
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                PEERTUBE_ADMIN_EMAIL: 'Peertube Admin Email',
                PT_INITIAL_ROOT_PASSWORD: 'Peertube Initial Root Password',
                PEERTUBE_WEBSERVER_HOSTNAME: 'Peertube Webserver Hostname',
              })
            "
          />
          <IconActionBtn
            tooltip="Preview"
            color="info"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.PEERTUBE_WEBSERVER_HOSTNAME"
          />
        </template>

        <template #Funkwhale-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                FUNKWHALE_HOSTNAME: 'Funkwhale Hostname',
                DJANGO_SUPERUSER_EMAIL: 'Django Superuser Email',
                DJANGO_SUPERUSER_USERNAME: 'Diango Superuser Username',
                DJANGO_SUPERUSER_PASSWORD: 'Django Superuser Password',
              })
            "
          />
          <IconActionBtn
            tooltip="Preview"
            color="info"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.FUNKWHALE_HOSTNAME"
          />
        </template>

        <template #Taiga-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                DOMAIN_NAME: 'Domain Name',
                ADMIN_USERNAME: 'Admin Username',
                ADMIN_PASSWORD: 'Admin Password',
                ADMIN_EMAIL: 'Admin Email',
                DEFAULT_FROM_EMAIL: 'Default Form Email',
                EMAIL_USE_TLS: 'Email Use TLS',
                EMAIL_USE_SSL: 'Email Use SSL',
                EMAIL_HOST: 'Email Host',
                EMAIL_PORT: 'Email Port',
                EMAIL_HOST_USER: 'Email Host User',
                EMAIL_HOST_PASSWORD: 'Email Host Password',
              })
            "
          />
          <IconActionBtn
            tooltip="Admin Panel"
            color="info"
            icon="mdi-view-dashboard"
            :href="'http://' + item.value[0].env.DOMAIN_NAME + '/admin/'"
          />
          <IconActionBtn
            tooltip="Preview"
            color="secondary"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.DOMAIN_NAME"
          />
        </template>

        <template #Presearch-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                PRESEARCH_REGISTRATION_CODE: 'Presearch Registration Code',
                PRESEARCH_BACKUP_PRI_KEY: 'Presearch Backup Private Key',
                PRESEARCH_BACKUP_PUB_KEY: 'Presearch Backup Public Key',
              })
            "
          />
        </template>

        <template #Mattermost-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                DB_PASSWORD: 'Database Password',
                SITE_URL: 'Site URL',
                SMTPUsername: 'SMTP Username',
                SMTPPassword: 'SMTP Password',
                SMTPServer: 'SMTP Server',
                SMTPPort: 'SMTP Port',
                SSH_KEY: 'Public SSH Key',
                MATTERMOST_DOMAIN: 'Mattermost Domain',
              })
            "
          />
          <IconActionBtn tooltip="Preview" color="info" icon="mdi-web" :href="item.value[0].env.SITE_URL" />
        </template>

        <template #Discourse-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                DISCOURSE_HOSTNAME: 'Discourse Hostname',
                DISCOURSE_DEVELOPER_EMAILS: 'Discourse Developer Emails',
                DISCOURSE_SMTP_ADDRESS: 'Discourse SMTP Address',
                DISCOURSE_SMTP_PORT: 'Discourse SMTP Port',
                DISCOURSE_SMTP_ENABLE_START_TLS: 'Discourse SMTP Enable Start TLS',
                DISCOURSE_SMTP_USER_NAME: 'Discourse SMTP Username',
                DISCOURSE_SMTP_PASSWORD: 'Discourse SMTP Password',
                THREEBOT_PRIVATE_KEY: 'Threebot Private Key',
                FLASK_SECRET_KEY: 'Flask Secret Key',
              })
            "
          />
          <IconActionBtn
            tooltip="Preview"
            color="info"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.DISCOURSE_HOSTNAME"
          />
        </template>

        <template #Casperlabs-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                CASPERLABS_HOSTNAME: 'Casperlabs Hostname',
              })
            "
          />
          <IconActionBtn
            tooltip="Preview"
            color="info"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.CASPERLABS_HOSTNAME"
          />
        </template>

        <template #Owncloud-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                OWNCLOUD_DOMAIN: 'Owncloud Domain',
                OWNCLOUD_ADMIN_USERNAME: 'Owncloud Admin Username',
                OWNCLOUD_ADMIN_PASSWORD: 'Owncloud Admin Password',
                OWNCLOUD_MAIL_SMTP_SECURE: 'Owncloud Mail SMTP Secure',
                OWNCLOUD_MAIL_DOMAIN: 'Owncloud Mail Domain',
                OWNCLOUD_MAIL_FROM_ADDRESS: 'Owncloud Mail From Address',
                OWNCLOUD_MAIL_SMTP_HOST: 'Owncloud Mail SMTP Host',
                OWNCLOUD_MAIL_SMTP_PORT: 'Owncloud Mail SMTP Port',
                OWNCLOUD_MAIL_SMTP_NAME: 'Owncloud Mail SMTP Name',
                OWNCLOUD_MAIL_SMTP_PASSWORD: 'Owncloud Mail SMTP Password',
              })
            "
          />
          <IconActionBtn
            tooltip="Preview"
            color="info"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.OWNCLOUD_DOMAIN"
          />
        </template>

        <template #Subsquid-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                CHAIN_ENDPOINT: 'Chain Endpoint',
                SUBSQUID_WEBSERVER_HOSTNAME: 'Subsquid Webserver Hostname',
              })
            "
          />
          <IconActionBtn
            tooltip="Preview"
            color="info"
            icon="mdi-web"
            :href="'https://' + item.value[0].env.SUBSQUID_WEBSERVER_HOSTNAME + '/graphql'"
          />
        </template>

        <template #Algorand-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                NETWORK: 'Network',
                NODE_TYPE: 'Node Type',
                ACCOUNT_MNEMONICS: 'Account Mnemonics',
                FIRST_ROUND: 'First Round',
                LAST_ROUND: 'Last Round',
              })
            "
          />
        </template>

        <template #NodePilot-actions="{ item }">
          <IconActionBtn
            tooltip="Show Details"
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
              })
            "
          />
          <IconActionBtn
            tooltip="Visit"
            color="info"
            icon="mdi-web"
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
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                USERNAME: 'Username',
                PASSWORD: 'Password',
                UMBREL_DISK: 'Umbrel Disk',
              })
            "
          />
          <IconActionBtn
            tooltip="Admin Panel"
            color="info"
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
            icon="mdi-information-outline"
            @click="
              layout.openDialog(item?.value, {
                SSH_KEY: 'Public SSH Key',
                MYSQL_USER: 'Mysql User',
                MYSQL_PASSWORD: 'Mysql Password',
                ADMIN_EMAIL: 'Admin Email',
                WP_URL: 'WP URL',
              })
            "
          />
          <IconActionBtn tooltip="Preview" color="info" icon="mdi-web" :href="'https://' + item.value[0].env.WP_URL" />
          <IconActionBtn
            tooltip="Admin Panel"
            color="secondary"
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
        >
          <template #actions="{ item }">
            <IconActionBtn
              tooltip="Show Details"
              icon="mdi-information-outline"
              @click="
                layout.openDialog(item?.value, {
                  SSH_KEY: 'Public SSH Key',
                  K3S_TOKEN: 'K3S Token',
                  K3S_DATA_DIR: 'K3S Data Directory',
                  K3S_FLANNEL_IFACE: 'K3S Flannel Iface',
                  K3S_NODE_NAME: 'K3S Node Name',
                  K3S_URL: 'K3S URL',
                })
              "
            />
            <IconActionBtn
              icon="mdi-cog"
              tooltip="Manage Workers"
              color="secondary"
              @click="dialog = item.value.deploymentName"
            />

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
import { useProfileManager } from "../stores";
import { deleteDeployment } from "../utils/delete_deployment";
import { getGrid, updateGrid } from "../utils/grid";

const props = defineProps<{ projectName?: ProjectName }>();

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
  { title: "Presearch", value: "Presearch", imgPath: "images/icons/presearch.png" },
  { title: "Subsquid", value: "Subsquid", imgPath: "images/icons/subsquid.png" },
  { title: "Casperlabs", value: "Casperlabs", imgPath: "images/icons/casperlabs.png" },
  { title: "Algorand", value: "Algorand", imgPath: "images/icons/algorand.png" },
  { title: "Node Pilot", value: "NodePilot", imgPath: "images/icons/vm.png" },
  { title: "Umbrel", value: "Umbrel", imgPath: "images/icons/umbrel.png" },
  { title: "Wordpress", value: "Wordpress", imgPath: "images/icons/wordpress.png" },
];

const profileManager = useProfileManager();

const layout = ref();
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
import type { ProjectName } from "../types";

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
