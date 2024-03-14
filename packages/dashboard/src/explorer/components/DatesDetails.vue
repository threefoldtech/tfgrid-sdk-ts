<template>
  <!-- 
    // leave it for now | should be needed later :(
    <v-card flat>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          Created At
        </v-list-item-title>
      </v-list-item-content>
      {{ item.createdAt | date }}
    </v-list-item>
    <v-divider />

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          Updated {{ item.updatedAt ? "At" : "" }}
        </v-list-item-title>
      </v-list-item-content>
      <template v-if="item.updatedAt">
        {{ item.updatedAt | date }}
      </template>
      <template v-if="!item.updatedAt">
        <v-icon color="red">
          mdi-close
        </v-icon>
      </template>
    </v-list-item>
    <v-divider />

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          Deleted {{ item.deletedAt ? "At" : "" }}
        </v-list-item-title>
      </v-list-item-content>
      <template v-if="item.deletedAt">
        {{ item.deletedAt | date }}
      </template>
      <template v-if="!item.deletedAt">
        <v-icon color="red">
          mdi-close
        </v-icon>
      </template>
    </v-list-item>
  </v-card> -->
  <span />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

interface IDates {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

@Component({})
export default class DatesDetails extends Vue {
  @Prop({ required: true }) item!: IDates;
}
</script>
