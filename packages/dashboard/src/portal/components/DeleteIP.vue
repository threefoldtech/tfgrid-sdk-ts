<template>
  <div class="text-center">
    <v-dialog v-model="open" width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" outlined x-small block> Delete IP </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5"> Delete IP </v-card-title>

        <v-card-text>
          <div class="text">
            <span>Are you sure you want to delete IP: {{ decodeHex(ip.ip) }}</span>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-2 black--text" @click="open = false"> Cancel </v-btn>
          <v-btn color="red" text @click="deletePublicIP()"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { hex2a } from "@/portal/lib/util";
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({
  name: "DeleteIP",
})
export default class DeleteIP extends Vue {
  open = false;
  @Prop({ required: true }) ip!: { ip: string };
  deletePublicIP() {
    this.open = false;
    this.$emit("delete");
  }
  decodeHex(input: string) {
    return hex2a(input);
  }
}
</script>
