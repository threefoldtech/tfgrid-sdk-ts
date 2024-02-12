<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-swap-horizontal</v-icon>
      <v-card-title class="pa-0">Transfer TFT Across Chains</v-card-title>
    </v-card>
    <v-card class="pa-5 white--text">
      <v-row class="pa-5 text-center">
        <v-col cols="12">
          <v-text-field model-value="Stellar" label="Selected Chain" variant="outlined" readonly></v-text-field>
        </v-col>
      </v-row>
      <v-row class="pa-4 px-8">
        <v-btn variant="outlined" color="secondary" @click="navigation">Learn How?</v-btn>
        <div class="ml-auto">
          <v-btn variant="outlined" color="secondary" class="mr-2" @click="openWithdrawDialog = true">Withdraw</v-btn>
          <v-btn color="primary" class="mr-2" @click="openDepositDialog = true">Deposit</v-btn>
        </div>
      </v-row>
    </v-card>
  </div>

  <!-- Deposit Dialog -->
  <deposit-dialog
    v-if="openDepositDialog"
    :selectedName="selectedName"
    :depositWallet="depositWallet"
    :qrCodeText="qrCodeText"
    :depositFee="depositFee"
    :openDepositDialog="openDepositDialog"
    :twinId="profileManager.profile?.twinId"
    @close="openDepositDialog = false"
  ></deposit-dialog>

  <!-- Withdraw Dialog -->
  <withdraw-dialog
    v-if="openWithdrawDialog"
    :selectedName="selectedName"
    :withdrawFee="withdrawFee"
    :openWithdrawDialog="openWithdrawDialog"
    :freeBalance="freeBalance"
    @close="openWithdrawDialog = false"
  ></withdraw-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, loadBalance } from "../utils/grid";

const profileManager = useProfileManager();
const items = ref([{ id: 1, name: "stellar" }]);
const selectedItem = ref(items.value[0]);
const openDepositDialog = ref(false);
const openWithdrawDialog = ref(false);
const selectedName = ref("");
const withdrawFee = ref(0);
const freeBalance = ref(0);
const depositWallet = ref("");
const qrCodeText = ref("");
const depositFee = ref(0);

onMounted(async () => {
  selectedName.value = items.value.filter(item => item.id === selectedItem.value.id)[0].name;
  depositWallet.value = window.env.BRIDGE_TFT_ADDRESS;
  qrCodeText.value = `TFT:${depositWallet.value}?message=twin_${profileManager.profile?.twinId}&sender=me`;
  try {
    const grid = await getGrid(profileManager.profile!);
    if (grid) {
      const WithdrawFee = await grid.bridge.getWithdrawFee();
      withdrawFee.value = WithdrawFee;

      const DepositFee = await grid.bridge.getDepositFee();
      depositFee.value = DepositFee;

      const balance = await loadBalance(grid);
      freeBalance.value = balance.free;
    }
  } catch (e) {
    console.log(e);
  }
});

function navigation() {
  window.open(
    "https://manual.grid.tf/threefold_token/tft_bridges/tfchain_stellar_bridge.html#how-to-use-the-tfchain-stellar-bridge",
    "_blank",
  );
}
</script>

<script lang="ts">
import DepositDialog from "@/components/deposit_dialog.vue";
import WithdrawDialog from "@/components/withdraw_dialog.vue";

export default {
  name: "Bridge",
  components: {
    DepositDialog,
    WithdrawDialog,
  },
};
</script>
