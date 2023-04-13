<template>
  <v-container>
    <v-card>
      <v-tabs v-model="activeTab" background-color="deep-blue accent-4" centered dark @change="onTabChange()">
        <v-tab v-for="tab in tabs" :key="tab.index" :value="tab.query" :href="'#' + tab.query">
          {{ tab.label }}
        </v-tab>
      </v-tabs>
      <NodesTable
        :tab="tabs.find(tab => tab.query === activeTab)"
        :twinId="$store.state.credentials.twin.id"
        :trigger="trigger"
      />
    </v-card>
  </v-container>
</template>

<script lang="ts">
import NodesTable from "../components/NodesTable.vue";
import { Component, Vue } from "vue-property-decorator";
import { ITab } from "../lib/nodes";

@Component({
  name: "NodesView",
  components: { NodesTable },
})
export default class NodesView extends Vue {
  tabs: ITab[] = [
    {
      label: "Rentable",
      value: "rentable",
      query: "rentable",
      index: 1,
    },
    {
      label: "Rented",
      value: "rented",
      query: "rented",
      index: 2,
    },
    {
      label: "Mine",
      value: "mine",
      query: "rented_by",
      index: 3,
    },
  ];
  $api = "";
  activeTab = this.tabs[0].query;
  trigger = "";

  mounted() {
    if (!(this.$api && this.$store.state.credentials.initialized)) {
      this.$router.push({ name: "accounts", path: "/" });
    }
  }

  onTabChange() {
    this.trigger = Math.random().toString(36).slice(2);
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }
}
</script>
