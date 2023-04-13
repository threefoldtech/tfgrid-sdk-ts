<template>
  <v-card class="item text-center">
    <div class="item__img">
      <!--<v-icon size="30">
        {{ item.icon }}
      </v-icon>-->
      <h4 class="item__title d-inline">{{ item.title }}</h4>
      <v-divider color="white" class="mt-1" />

      <p class="item__data text-center">
        {{ item.data }}
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { IStatistics } from "../store/getters";

@Component({
  name: "StatisticsCard",
})
export default class StatisticsCard extends Vue {
  @Prop({ required: true }) item!: IStatistics;
}
</script>

<style lang="scss" scoped>
.theme--light.v-icon {
  color: #ffffff !important;
}
.theme--light.v-divider {
  color: rgb(255, 255, 255);
}
.item {
  padding: 5px;
  &__data {
    font-size: 21px !important;
  }
  &__title {
    font-size: 1.2rem !important;
  }
}
</style>
