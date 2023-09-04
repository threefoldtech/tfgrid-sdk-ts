<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="900" v-model="depositDialog">
      <v-card>
        <v-toolbar color="primary" dark> Deposit TFT </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                Send a transaction with your TFT's to deposit to:
                <ul>
                  <li>Destination</li>
                  <li>Memo Text</li>
                </ul>
              </v-col>
              <v-divider class="mx-4" vertical></v-divider>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const depositDialog = ref(false);

const props = defineProps({
  openDepositDialog: Boolean,
});

// async function created() {
//   if (!props.openDepositDialog) return;
//   depositDialog.value = true;
// }
</script>
