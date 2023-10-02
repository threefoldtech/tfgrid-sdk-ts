<template>
  <v-row class="ma-2">
    <v-col :cols="3">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        {{ "Heloo" }}
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-harddisk</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Node Resources </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "Node Details",
};
</script>
