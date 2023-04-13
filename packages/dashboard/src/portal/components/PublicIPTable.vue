<template>
  <v-expansion-panels v-model="panel" :disabled="disabled">
    <v-expansion-panel>
      <v-expansion-panel-header>Public IPs</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-simple-table class="table">
          <template v-slot:top>
            <v-toolbar flat>
              <CreateIP :loadingCreate="loadingCreate" @create="createPublicIP" />
            </v-toolbar>
          </template>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">IP</th>
                <th class="text-left">Gateway</th>
                <th class="text-left">Deployed Contract ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ip, i) in ips" :key="ip.ip">
                <td>{{ decodeHex(ip.ip) }}</td>
                <td>{{ decodeHex(ip.gateway) }}</td>
                <td>{{ ip.contractId }}</td>

                <td>
                  <v-progress-circular
                    v-if="loadingDelete && loading === i"
                    indeterminate
                    color="primary"
                    class="d-flex mx-auto"
                  ></v-progress-circular>
                  <DeleteIP v-else :ip="ip" @delete="deletePublicIP(ip, i)" />
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { hex2a } from "@/portal/lib/util";
import CreateIP from "./CreateIP.vue";
import DeleteIP from "./DeleteIP.vue";
interface ipInterface {
  ip: string;
  gateway: string;
  contractId: string;
}

@Component({
  name: "PublicIPTable",
  components: { CreateIP, DeleteIP },
})
export default class PublicIPTable extends Vue {
  panel = [0];
  disabled = false;
  @Prop({ required: true }) ips!: ipInterface[];
  @Prop({ required: true }) createIP!: any;
  @Prop({ required: true }) loadingCreate!: boolean;
  @Prop({ required: true }) deleteIP!: any;
  @Prop({ required: true }) loadingDelete!: boolean;

  loading: null | number = null;

  public decodeHex(input: string) {
    return hex2a(input);
  }
  createPublicIP(ips: string[], gateway: string) {
    this.createIP(ips, gateway);
  }
  deletePublicIP(ip: any, i: number) {
    this.loading = i;
    this.deleteIP(ip).finally(() => {
      this.loading = null;
    });
  }
}
</script>
