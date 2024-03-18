<template>
  <v-card class="pt-6 pl-6 pr-6 mb-4" variant="tonal">
    <div class="head">
      <h2 class="text-info">
        <v-icon> {{ headerIcon }} </v-icon>
        {{ headerTitle }}
      </h2>
    </div>

    <div class="table">
      <list-table
        class="pa-5 mt-3"
        :deleting="deleting"
        v-model="selectedKeys"
        :loading="loading"
        :headers="headers"
        :items="sshKeys"
      >
        <template #[`item.lastUsed`]="{ item }">
          <v-tooltip location="top" :text="`The most recent deployment activity associated with this SSH key.`">
            <template #activator="{ props }">
              <v-chip color="primary" v-bind="props">
                {{ item.value.lastUsed }}
              </v-chip>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.createdAt`]="{ item }">
          <v-tooltip location="top" :text="`The date when this SSH key was created.`">
            <template #activator="{ props }">
              <v-chip color="primary" v-bind="props">
                {{ item.value.createdAt }}
              </v-chip>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.fingerPrint`]="{ item }">
          <v-tooltip
            location="top"
            :text="`The fingerprint of an SSH key is a unique identifier generated from the key's contents. It's displayed as a sequence of hexadecimal characters and serves to verify the key's authenticity.`"
          >
            <template #activator="{ props }">
              <p v-bind="props">
                {{ item.value.fingerPrint }}
              </p>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.activation`]="{ item }">
          <v-tooltip v-if="item.value.isActive" :text="`The ${item.value.name} key is activated!`">
            <template #activator="{ props }">
              <v-chip @click="activateKey(item.value)" class="activation" v-bind="props" color="green">
                <v-icon>mdi-check</v-icon>
                Activated
              </v-chip>
            </template>
          </v-tooltip>

          <v-tooltip v-else :text="`Click to active ${item.value.name} key.`">
            <template #activator="{ props }">
              <v-progress-circular v-if="activating" color="primary" indeterminate></v-progress-circular>
              <v-chip v-else @click="activateKey(item.value)" class="activation" v-bind="props" color="error">
                <v-icon>mdi-close</v-icon>
                Not Activated
              </v-chip>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.deletion`]="{ item }">
          <v-tooltip :text="`Delete ${item.value.name}`">
            <template #activator="{ props }">
              <v-btn
                :disabled="loading || deleting"
                :loading="deleting"
                color="error"
                @click="deleteKey(item.value)"
                variant="tonal"
                v-bind="props"
                class="ml-2"
              >
                <v-icon class="pt-1">mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </list-table>
    </div>

    <div class="bottom mt-3">
      <v-tooltip location="bottom" text="Export all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="selectedKeys.length !== sshKeys.length"
            class="mr-2"
            v-bind="props"
            prepend-icon="mdi-export"
            color="primary"
            variant="tonal"
          >
            Export
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" text="Delete all selected keys.">
        <template #activator="{ props }">
          <v-btn
            :disabled="selectedKeys.length !== sshKeys.length"
            v-bind="props"
            variant="tonal"
            prepend-icon="mdi-trash-can-outline"
            color="error"
          >
            Delete
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

import ListTable from "@/components/list_table.vue";
import { SSHKeyData, VDataTableHeader } from "@/types";

export default defineComponent({
  props: {
    sshKeys: {
      type: Object as PropType<SSHKeyData[]>,
      required: true,
    },
    headerTitle: {
      type: String,
      required: true,
    },
    headerIcon: {
      type: String,
      required: true,
    },
  },

  components: {
    ListTable,
  },

  methods: {
    deleteKey(item: any) {
      this.deleting = true;
      this.loading = true;
      console.log("Item", item.id);
    },
    activateKey(item: any) {
      this.activating = true;
      console.log("Item", item.id);
    },
  },

  setup() {
    const loading = ref<boolean>(false);
    const deleting = ref<boolean>(false);
    const activating = ref<boolean>(false);
    const selectedKeys = ref<SSHKeyData[]>([]);

    const headers: VDataTableHeader = [
      {
        title: "ID",
        key: "id",
      },
      {
        title: "Name",
        key: "name",
      },
      {
        title: "Creation Datetime",
        key: "createdAt",
      },
      {
        title: "Last Used",
        key: "lastUsed",
      },
      {
        title: "Key Fingerprint",
        key: "fingerPrint",
      },
      {
        title: "Activation",
        key: "activation",
      },
      {
        title: "Deletion",
        key: "deletion",
      },
    ];

    return { headers, loading, selectedKeys, deleting, activating };
  },
});
</script>

<style scoped>
.head {
  border-bottom: 1px solid #8d848d;
  padding-bottom: 15px;
}

.bottom {
  width: 100%;
  border-top: 1px solid #8d848d;
  padding: 15px;
}
.activation {
  cursor: pointer;
}
</style>
