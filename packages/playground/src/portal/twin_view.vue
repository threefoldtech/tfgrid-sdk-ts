<template>
  <div>
    <delete-relay-dialog
      v-if="isDeleteRelay"
      :is-delete="isDeleteRelay"
      :relay="selectedRelay!"
      :relays="relays"
      :is-loading="isLoading"
      :errorMessage="errorMessage"
      @confirm="onConfirmDeleteRelay"
      @cancel="onCancelDeleteRelay"
    />

    <vote-reminder-dialog
      v-if="isOpenVotePopup"
      :open-vote-popup="isOpenVotePopup"
      :numberOfProposalsToVoteOn="numberOfProposalsToVoteOn"
      @vote="redirectToDao"
      @close="closeVotePopup"
    />

    <NewRelayDialog
      v-if="isNewRelay"
      :is-loading="isLoading"
      :error-message="newErrorMessage"
      :is-new-relay="isNewRelay"
      @save="onAddNewRelay"
      @cancel="cancelNewRelay"
      @validate-relay="onValidateNewRelay"
    />

    <div class="border px-4 pb-4 rounded position-relative mt-2">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-account-supervisor-outline</v-icon>
        <v-card-title class="pa-0">Twin Details</v-card-title>
      </v-card>

      <twin-details-component
        :relays="relays"
        :is-loading="isLoading"
        :errorMessage="errorMessage"
        @copy-address="onCopyAddress"
        @delete-relay="onDeleteRelay"
        @update-relay="onUpdateRelay"
        @new-relay="onNewRelay"
        @validate-relay="onValidateUpdateRelay"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { generatePublicKey } from "@threefold/rmb_direct_client";
import { defineComponent, onMounted, ref } from "vue";

import router from "@/router";
import { useProfileManager } from "@/stores";
import type { Profile } from "@/stores/profile_manager";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getFarms } from "@/utils/get_farms";
import { getGrid } from "@/utils/grid";

import type { Farm } from "../types";
import TwinDetailsComponent from "./components/twin_details.vue";
import DeleteRelayDialog from "./dialogs/delete_relay_dialog.vue";
import NewRelayDialog from "./dialogs/new_relay_dialog.vue";
import VoteReminderDialog from "./dialogs/vote_reminder_dialog.vue";

const profileManager = useProfileManager();

const isDeleteRelay = ref<boolean>(false);
const isOpenVotePopup = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isNewRelay = ref<boolean>(false);

const selectedRelay = ref<string>();
const errorMessage = ref<string>();
const newErrorMessage = ref<string>();
const relays = ref<string[]>([]);

const numberOfProposalsToVoteOn = ref(0);
const activeProposalsUserHasVotedOn = ref(0);
const userFarms = ref<Farm[]>();

onMounted(async () => {
  const profile = profileManager.profile;
  if (profile) {
    // profile.relay = "r1.3x0.me_relay.dev.grid.tf"; // For testing.
    relays.value = profile.relay.split("_");
    const grid = await getGrid(profile);
    if (!grid) {
      createCustomToast("Fetch Grid Failed", ToastType.danger);
      return;
    }

    userFarms.value = await getFarms(grid, { ownedBy: profile.twinId }, {});
    if (!userFarms.value.length) {
      return;
    }

    const proposals = grid.dao.get();
    const userFarmId = userFarms.value.map(farm => farm.farmID);

    const activeProposals = (await proposals)?.active;
    const numberOfActiveProposals = activeProposals ? activeProposals.length : 0;

    if (!numberOfActiveProposals) {
      return;
    }

    activeProposals.forEach(proposal => {
      if (proposal.nayes.filter(naye => userFarmId.includes(naye.farmId)).length) {
        activeProposalsUserHasVotedOn.value++;
      } else if (proposal.ayes.filter(aye => userFarmId.includes(aye.farmId)).length) {
        activeProposalsUserHasVotedOn.value++;
      }
    });

    if (activeProposalsUserHasVotedOn.value == numberOfActiveProposals) {
      return;
    }
    numberOfProposalsToVoteOn.value = numberOfActiveProposals - activeProposalsUserHasVotedOn.value;
    isOpenVotePopup.value = true;
  }
});

function onCopyAddress(address: string) {
  // An event from the twin details component emits when copy the profile address.
  navigator.clipboard.writeText(address);
  createCustomToast("Address copied to clipboard", ToastType.success);
}

function onNewRelay() {
  // An event from the twin details component emits when requesting to add a new relay.
  onCancelDeleteRelay();
  isNewRelay.value = true;
  errorMessage.value = undefined;
}

function onDeleteRelay(relay: string) {
  // An event from the twin details component emits when selecting a relay for deletion.
  selectedRelay.value = relay;
  isDeleteRelay.value = true;
}

function onCancelDeleteRelay() {
  // An event from the delete dialog component emits when canceling the selected relay.
  selectedRelay.value = undefined;
  errorMessage.value = undefined;
  isDeleteRelay.value = false;
}

async function onConfirmDeleteRelay(relay: string) {
  // An event from the delete dialog component emits when deleting the selected relay.
  errorMessage.value = undefined;
  isLoading.value = true;
  if (relay) {
    const profile = profileManager.profile;
    errorMessage.value = undefined;
    isLoading.value = true;
    const relayIdx = relays.value.indexOf(relay);
    if (relayIdx === -1) {
      errorMessage.value = "Cannot find the selected relay in your relays, please try again.";
      createCustomToast(errorMessage.value, ToastType.danger);
      isLoading.value = false;
      return;
    }

    if (profile) {
      try {
        // We should make the relays separated by underscores first.
        const newRelays = [...relays.value];
        newRelays.splice(relays.value.indexOf(relay), 1);
        const newRelays_ = newRelays.join("_");
        await updatedRelay(profile, newRelays_);
      } catch (e) {
        createCustomToast(`Could not delete relay or pk, Error: ${e}`, ToastType.danger);
        errorMessage.value = (e as any).message;
        isLoading.value = false;
        return;
      }
      relays.value.splice(relays.value.indexOf(relay), 1);
      createCustomToast(`Relay '${relay}' has been deleted successfully.`, ToastType.success);
      onCancelDeleteRelay();
      isLoading.value = false;
    }
  } else {
    createCustomToast("Delete failed: Cannot find the selected relay.", ToastType.danger);
    isLoading.value = false;
    return;
  }
}

async function onUpdateRelay(oldRelay: string, newRelay: string) {
  // An event from the twin details component emits when updating the selected relay.
  const profile = profileManager.profile;
  errorMessage.value = undefined;
  isLoading.value = true;
  const relayIdx = relays.value.indexOf(oldRelay);
  if (relayIdx === -1) {
    errorMessage.value = "Cannot find the selected relay in your relays, please try again.";
    createCustomToast(errorMessage.value, ToastType.danger);
    isLoading.value = false;
    return;
  }

  if (profile) {
    try {
      // We should make the relays separated by underscores first.
      const newRelays = [...relays.value];
      newRelays.splice(relays.value.indexOf(oldRelay), 1);
      newRelays.splice(relayIdx, 0, newRelay);
      const newRelays_ = newRelays.join("_");

      await updatedRelay(profile, newRelays_);
    } catch (e) {
      createCustomToast(`Could not update relay or pk, Error: ${e}`, ToastType.danger);
      errorMessage.value = (e as any).message;
      isLoading.value = false;
      throw new Error((e as any).message);
    }

    // Update the list of relays to be displayed in UI.
    relays.value.splice(relays.value.indexOf(oldRelay), 1);
    relays.value.splice(relayIdx, 0, newRelay);
    createCustomToast(`Relay '${oldRelay}' has been updated to ${newRelay} successfully.`, ToastType.success);
    isLoading.value = false;
  }
}

async function onAddNewRelay(relay: string) {
  // An event from the new relay component emits when adding new relay.
  const profile = profileManager.profile;
  errorMessage.value = undefined;
  isLoading.value = true;

  if (profile) {
    try {
      // We should make the relays separated by underscores first.
      const newRelays = [...relays.value, relay];
      const newRelays_ = newRelays.join("_");

      await updatedRelay(profile, newRelays_);
    } catch (e) {
      createCustomToast(`Could not update relay or pk, Error: ${e}`, ToastType.danger);
      newErrorMessage.value = (e as any).message;
      isLoading.value = false;
      throw new Error((e as any).message);
    }

    // Update the list of relays to be displayed in UI.
    relays.value.push(relay);
    createCustomToast(`Relays have been updated with new ${relay} relay successfully.`, ToastType.success);
    isLoading.value = false;
    isNewRelay.value = false;
  }
}

async function updatedRelay(profile: Profile, newRelays: string) {
  // Update the profile relay in tf-chain.
  const pk = generatePublicKey(profile.mnemonic);
  const grid = await getGrid(profile);
  // TODO: Check the error here.
  await grid?.twins.update({ relay: newRelays });

  profileManager.updateRelay(newRelays);
  profileManager.updatePk(pk);
}

function validateRelay(relay: string): string | undefined {
  // Check the provided relay and return string as error message in case of valid and undefined if not.
  const specialChars = /[`!@#$%^&*()_+\-=\\[\]{};':"\\|,<>\\/?~ ]/;
  if (!relay === undefined || relay.trim().length === 0) {
    return "Please enter a valid relay.";
  } else if (relay.trim().length < 5) {
    return "The relay length must be equal to or more than 5 chars.";
  } else if (!relay.includes(".")) {
    return "The relay must be parts separated by dots.";
  } else if (specialChars.test(relay)) {
    return "The relay cannot contain special chars or spaces.";
  } else {
    return undefined;
  }
}

function onValidateUpdateRelay(relay: string) {
  // An event from the new relay dialog component emits when updating the value of the entred relay to validate it.
  errorMessage.value = validateRelay(relay);
}

function onValidateNewRelay(relay: string) {
  // An event from the new relay dialog component emits when updating the value of the entred relay to validate it.
  newErrorMessage.value = validateRelay(relay);
}

function redirectToDao() {
  router.push({ path: "/portal/dao" });
}

function closeVotePopup() {
  isOpenVotePopup.value = false;
}

function cancelNewRelay() {
  isNewRelay.value = false;
  newErrorMessage.value = undefined;
}
</script>

<script lang="ts">
export default defineComponent({
  name: "TwinView",
});
</script>
