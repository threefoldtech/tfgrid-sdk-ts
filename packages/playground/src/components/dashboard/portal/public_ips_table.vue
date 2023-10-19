<template v-if="isRemoved">
  <div class="my-6">
    <v-data-table :headers="headers" :items="publicIps" class="elevation-1">
      <template v-slot:top>
        <div class="d-flex ma-4 align-center">
          <p class="text-subtitle-1 font-weight-bold p-3 w-50">Public IPs</p>
          <AddIP
            v-model:farmId="$props.farmId"
            v-model:type="type"
            v-model:publicIP="publicIP"
            v-model:toPublicIP="toPublicIP"
            v-model:gateway="gateway"
            @add-publicIPs="publicIps.push(...$event)"
          />
        </div>
      </template>
      <template #[`item.ip`]="{ item }">
        {{ item.ip || "-" }}
      </template>

      <template #[`item.gateway`]="{ item }">
        {{ item.gateway || "-" }}
      </template>

      <template #[`item.contract_id`]="{ item }">
        {{ item.ip || "-" }}
      </template>
      <template #[`item.actions`]="{ item, index }">
        <v-btn color="red-darken-1" @click="showDialogue = true" :disabled="loading" :loading="loading">
          Delete IP
        </v-btn>
        <v-dialog v-model="showDialogue" max-width="600">
          <v-card>
            <v-toolbar color="primary" dark class="font-weight-bold px-3">Delete IP</v-toolbar>
            <v-card-text> Are you sure you want to delete IP {{ item.ip }}? </v-card-text>
            <v-card-actions class="justify-end px-5 pb-5 pt-0">
              <v-btn
                color="red-darken-1"
                @click="removeFarmIp({ farmId: $props.farmId, ip: item.ip }, index)"
                :loading="loading"
                :disabled="isRemoving"
                >Delete</v-btn
              >
              <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
      <template #bottom></template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import type { RemoveFarmIPModel } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useGrid } from "@/stores";

import { createCustomToast, ToastType } from "../../../utils/custom_toast";
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
    const loading = ref(false);
    const showDialogue = ref(false);
    enum IPType {
      single = "Single",
      range = "Range",
    }
    const type = ref(IPType.single);
    const publicIP = ref();
    const toPublicIP = ref();
    const gateway = ref();
    const isRemoved = ref(false);
    const isRemoving = ref(false);

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
    async function removeFarmIp(options: RemoveFarmIPModel, index: number) {
      try {
        isRemoving.value = true;
        await gridStore.grid.farms.removeFarmIp({ ip: options.ip, farmId: options.farmId });
        createCustomToast("IP is deleted successfully!", ToastType.success);
        isRemoved.value = true;
        showDialogue.value = false;
        publicIps.value.splice(index, 1);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to delete IP!", ToastType.danger);
      } finally {
        isRemoving.value = false;
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
      isRemoved,
      isRemoving,
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
