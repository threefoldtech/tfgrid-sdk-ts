<template>
  <v-container>
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-account</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> {{ title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> ID </v-list-item-title>
        </v-list-item-content>
        {{ twin.twinId }}
      </v-list-item>
      <v-divider />

      <v-list-item class="accountId">
        <v-list-item-content>
          <v-list-item-title> Account ID </v-list-item-title>
        </v-list-item-content>
        {{ twin.accountId }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> RELAY </v-list-item-title>
        </v-list-item-content>
        {{ twin.relay }}
      </v-list-item>
      <v-divider />
    </v-list>
  </v-container>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ITwin } from "../graphql/api";

@Component({
  components: {},
})
export default class TwinDetails extends Vue {
  @Prop({ required: true }) twin!: ITwin;
  @Prop({ required: true }) title!: string;
}
</script>
