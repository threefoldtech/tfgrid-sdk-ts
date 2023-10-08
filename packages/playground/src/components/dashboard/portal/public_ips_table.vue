<template v-if="publicIps.length">
  <div class="my-6">
    <v-data-table :headers="headers" :items="publicIps" item-value="name" class="elevation-1">
      <template v-slot:top>
        <div class="d-flex ma-4 align-center">
          <p class="text-subtitle-1 font-weight-bold p-3 w-50">Public IPs</p>
          <AddIP
            v-model:farmId="$props.farmId"
            v-model:type="type"
            v-model:publicIP="publicIP"
            v-model:toPublicIP="toPublicIP"
            v-model:gateway="gateway"
          />
        </div>
      </template>
      <template v-slot:item="{ item }">
        <tr class="text-center">
          <td>
            {{ item.value.ip || "-" }}
          </td>
          <td>
            {{ item.value.gateway || "-" }}
          </td>
          <td>
            {{ item.value.contract_id || "-" }}
          </td>
          <td>
            <v-btn color="red-darken-1" @click="showDialogue = true" :disabled="loading" :loading="loading">
              Delete IP
            </v-btn>
          </td>
        </tr>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-container v-if="showDialogue">
          <v-dialog v-model="showDialogue" max-width="600">
            <v-card>
              <v-toolbar color="primary" dark class="custom-toolbar">Delete IP</v-toolbar>
              Are you sure you want to delete IP {{ item.value.ip }}?
              <v-card-actions class="justify-end px-5 pb-5 pt-0">
                <v-btn @click="removeFarmIp({ farmId: $props.farmId, ip: item.value.ip })"> Delete </v-btn>
                <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </template>
      <template #bottom></template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import type { RemoveFarmIPModel } from "@threefold/grid_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted, ref } from "vue";

import { useGrid } from "@/stores";

import AddIP from "./add_ip.vue";

export default {
  name: "PublicIPsTable",
  props: ["farmId"],
  components: {
    AddIP,
  },
  setup(props) {
    const gridStore = useGrid();
    const headers = [
      {
        title: "IP",
        align: "center",
        key: "ip",
      },
      {
        title: "Gateway",
        align: "center",
        key: "gateway",
      },
      {
        title: "Deployed Contract ID",
        align: "center",
        key: "contract_id",
      },
      { title: "Actions", align: "center", sortable: false, key: "actions" },
    ] as any;
    const publicIps = ref();
    const loading = ref();
    const showDialogue = ref(false);
    enum IPType {
      single = "Single",
      range = "Range",
    }
    const type = ref(IPType.single);
    const publicIP = ref();
    const toPublicIP = ref();
    const gateway = ref();
    onMounted(async () => {
      await getFarmByID(props.farmId);
    });
    async function getFarmByID(id: number) {
      try {
        const farm = await gridStore.grid.farms.getFarmByID({ id });
        publicIps.value = farm.publicIps;
      } catch (error) {
        console.log(error);
      }
    }
    async function removeFarmIp(options: RemoveFarmIPModel) {
      try {
        await gridStore.grid.farms.removeFarmIp({ ip: options.ip, farmId: options.farmId });
        createToast(`IP is deleted successfully!`, {
          position: "bottom-right",
          hideProgressBar: true,
          toastBackgroundColor: "#1aa18f",
          timeout: 5000,
          type: "success",
          showIcon: true,
        });
      } catch (error) {
        console.log(error);
        createToast(`Failed to delete IP!`, {
          position: "bottom-right",
          hideProgressBar: true,
          toastBackgroundColor: "#FF5252",
          timeout: 5000,
          type: "danger",
          showIcon: true,
        });
      }
    }
    return {
      gridStore,
      headers,
      publicIps,
      type,
      publicIP,
      toPublicIP,
      gateway,
      loading,
      showDialogue,
      removeFarmIp,
    };
  },
};
</script>
<style scoped>
.v-toolbar {
  max-height: 3rem;
}
</style>
