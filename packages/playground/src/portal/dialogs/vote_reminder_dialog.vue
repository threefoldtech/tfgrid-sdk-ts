<template>
  <v-dialog v-model="$props.openVotePopup" max-width="600">
    <v-card>
      <v-toolbar height="45" color="primary" class="custom-toolbar">
        <div class="ml-2">Vote Reminder</div>
      </v-toolbar>
      <v-card-text>There are {{ $props.numberOfProposalsToVoteOn }} active proposals you can vote on now</v-card-text>
      <v-card-actions class="justify-end pa-5">
        <v-btn @click="vote" variant="elevated" color="primary" class="mr-2 text-subtitle-2">Vote</v-btn>
        <v-btn @click="close" variant="outlined" color="anchor" class="mr-2 text-subtitle-2">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineComponent, defineProps, type PropType } from "vue";

defineProps({
  openVotePopup: {
    type: Object as PropType<boolean>,
    required: true,
  },

  numberOfProposalsToVoteOn: {
    type: Object as PropType<number>,
    required: true,
  },
});

const emits = defineEmits(["vote", "close"]);
const vote = () => emits("vote");
const close = () => emits("close");
</script>

<script lang="ts">
export default defineComponent({
  name: "VoteReminderDialog",
});
</script>
