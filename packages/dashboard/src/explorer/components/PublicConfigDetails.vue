<template>
  <v-container>
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-cog</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> Public Configs </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> IPv4 </v-list-item-title>
        </v-list-item-content>
        {{ config.ipv4 }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> GW4 </v-list-item-title>
        </v-list-item-content>
        {{ config.gw4 }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> IPv6 </v-list-item-title>
        </v-list-item-content>
        {{ config.ipv6 }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> GW6 </v-list-item-title>
        </v-list-item-content>
        {{ config.gw6 }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Domain </v-list-item-title>
        </v-list-item-content>
        {{ config.domain }}
      </v-list-item>
      <v-divider />

      <DatesDetails :item="config" />
    </v-list>
  </v-container>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { IPublicConfig } from "../graphql/api";
import DatesDetails from "./DatesDetails.vue";

@Component({
  components: {
    DatesDetails,
  },
})
export default class PublicConfigDetails extends Vue {
  @Prop({ required: true }) config!: IPublicConfig;
}
</script>
