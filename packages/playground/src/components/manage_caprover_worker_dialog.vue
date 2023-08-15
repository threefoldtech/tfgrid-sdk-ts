<template>
  <ManageWorkerDialog
    :workers="data"
    :selectedWorkers="selectedWorkers"
    :deleting="deleting"
    @close="$emit('close')"
    @deploy="deploy"
    @delete="onDelete"
    @back="updateCaprover"
  >
    <template #title>Manage Caprover({{ $props.master.name }}) Workers</template>

    <template #list>
      <ListTable
        :headers="[
          { title: 'PLACEHOLDER', key: 'data-table-select' },
          { title: 'Contract ID', key: 'contractId' },
          { title: 'Name', key: 'name' },
          { title: 'Public IPv4', key: 'publicIP.ip' },
          { title: 'CPU(vCores)', key: 'capacity.cpu' },
          { title: 'Memory(MB)', key: 'capacity.memory' },
          { title: 'Disk(GB)', key: 'disk' },
        ]"
        :items="data"
        :loading="false"
        :deleting="deleting"
        v-model="selectedWorkers"
      >
        <template #[`item.index`]="{ item }">
          {{ data.indexOf(item?.value) + 1 }}
        </template>

        <template #[`item.disk`]="{ item }">
          {{ calcDiskSize(item.value.mounts) }}
        </template>
      </ListTable>
    </template>

    <template #deploy>
      <CaproverWorker v-model="worker" />
    </template>
  </ManageWorkerDialog>

  <v-dialog v-if="caproverData" v-model="deployedDialog" scrollable width="500px">
    <v-card>
      <v-card-title> <strong>Add your worker</strong> </v-card-title>

      <v-divider />

      <v-card-text>
        <ol class="px-4">
          <li>
            Go to
            <a :href="'http://captain.' + master.env.CAPROVER_ROOT_DOMAIN" target="_blank" class="app-link">
              Admin Panel </a
            >.
          </li>
          <li>Go to the <strong>cluster</strong> tab.</li>
          <li>
            Click <strong>Add Self-Hosted Registry</strong> button then <strong>Enable Self-Hosted Registry</strong>.
          </li>
          <li>
            Insert worker node public IP
            <strong>{{ caproverData[caproverData.length - 1].publicIP.ip }}</strong> and add your private SSH Key.
          </li>
          <li>Click <strong>Join cluster</strong> button.</li>
        </ol>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="tonal" @click="deployedDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { useProfileManager } from "../stores";
import { ProjectName } from "../types";
import { addMachine, deleteMachine, loadVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import rootFs from "../utils/root_fs";

const props = defineProps<{ master: any; data: any[] }>();
const emits = defineEmits<{ (event: "close"): void; (event: "update:caprover", data: any): void }>();

const profileManager = useProfileManager();

const selectedWorkers = ref<any[]>([]);
const deleting = ref(false);
const deployedDialog = ref(false);

const worker = ref(createWorker());

function calcDiskSize(disks: { size: number }[]) {
  return disks.reduce((t, d) => t + d.size, 0) / 1024 ** 3;
}

const caproverData = ref<any>();
function updateCaprover() {
  if (!caproverData.value) return;
  emits("update:caprover", caproverData.value);
  caproverData.value = undefined;
}

async function deploy(layout: any) {
  layout.setStatus("deploy");

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, ProjectName.Caprover.toLowerCase());

    await layout.validateBalance(grid);

    const vm = await addMachine(grid!, {
      name: worker.value.name,
      deploymentName: props.master.name,
      cpu: worker.value.solution!.cpu,
      memory: worker.value.solution!.memory,
      disks: [
        {
          name: "data0",
          size: worker.value.solution!.disk,
          mountPoint: "/var/lib/docker",
        },
      ],
      flist: "https://hub.grid.tf/tf-official-apps/tf-caprover-main.flist",
      entryPoint: "/sbin/zinit init",
      farmId: worker.value.farm!.farmID,
      farmName: worker.value.farm!.name,
      country: worker.value.farm!.country,
      planetary: true,
      publicIpv4: true,
      envs: [
        { key: "SWM_NODE_MODE", value: "worker" },
        { key: "PUBLIC_KEY", value: props.master.env.PUBLIC_KEY },
      ],
      rootFilesystemSize: rootFs(worker.value.solution!.cpu, worker.value.solution!.memory),
    });

    caproverData.value = vm;
    deployedDialog.value = true;
    layout.setStatus("success", `Successfully add a new worker to Caprover('${props.master.name}') Instance.`);
  } catch (e) {
    layout.setStatus("failed", normalizeError(e, "Failed to deploy a caprover worker."));
  }
}

async function onDelete(cb: (workers: any[]) => void) {
  deleting.value = true;
  const grid = await getGrid(profileManager.profile!, ProjectName.Caprover.toLowerCase());
  for (const worker of selectedWorkers.value) {
    console.log(props.master.name, worker.name);

    try {
      await deleteMachine(grid!, {
        deploymentName: props.master.name,
        name: worker.name,
      });
    } catch (e) {
      console.log("Error while deleting worker", e);
    }
  }
  selectedWorkers.value = [];
  const data = await loadVM(grid!, props.master.name);
  cb(data.slice(1));
  emits("update:caprover", data);
  deleting.value = false;
}
</script>

<script lang="ts">
import CaproverWorker, { createWorker } from "../components/caprover_worker.vue";
import ListTable from "../components/list_table.vue";
import { normalizeError } from "../utils/helpers";
import ManageWorkerDialog from "./manage_worker_dialog.vue";

export default {
  name: "ManageCaproverWorkerDialog",
  components: {
    ManageWorkerDialog,
    CaproverWorker,
    ListTable,
  },
};
</script>
