<template>
  <v-card flat>
    <v-list-item>
      <v-list-item-icon>
        <v-icon size="40" class="mr-2">mdi-map-outline</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title style="font-size: 30px"> Country Details </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list>
      <!-- Flag Item -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Flag </v-list-item-title>
        </v-list-item-content>
        <img :src="src" alt="flag" width="40" />
      </v-list-item>
      <v-divider />

      <!-- CODE ISO 3 Item -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Name </v-list-item-title>
        </v-list-item-content>
        {{ country }}
      </v-list-item>
      <v-divider />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Code ISO 2 </v-list-item-title>
        </v-list-item-content>
        {{ code }}
      </v-list-item>

      <!-- City Item -->
      <template v-if="city">
        <v-divider />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> City </v-list-item-title>
          </v-list-item-content>
          {{ city }}
        </v-list-item>
      </template>

      <template v-if="location">
        <v-divider />
        <!-- CODE ISO 3 Item -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Latitude </v-list-item-title>
          </v-list-item-content>
          {{ location.latitude }}
        </v-list-item>
        <v-divider />

        <!-- CODE ISO 3 Item -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Longitude </v-list-item-title>
          </v-list-item-content>
          {{ location.longitude }}
        </v-list-item>
      </template>

      <!-- line -->
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { ILocation } from "../graphql/api";
import { Component, Prop, Vue } from "vue-property-decorator";
import { byCountry } from "country-code-lookup";

@Component({})
export default class CountryDetails extends Vue {
  @Prop({ required: false }) country?: string;
  @Prop({ required: false }) city?: string;
  @Prop({ required: false }) location?: ILocation;
  @Prop({ required: false }) code?: string;

  get src(): string {
    const conuntryCode = this.country && this.country?.length > 2 ? byCountry(this.country)?.internet : this.country;

    return conuntryCode?.toLocaleLowerCase() != "ch"
      ? `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.jpg`
      : `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.png`;
  }
}
</script>
