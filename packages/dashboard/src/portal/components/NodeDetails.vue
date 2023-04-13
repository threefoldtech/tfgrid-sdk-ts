<template>
  <v-row>
    <v-col :cols="4">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-harddisk</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Node Resources </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Details -->
        <v-row>
          <v-col cols="12">
            <v-list color="transparent">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> CPU </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.cru }} CPU
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Disk (HDD) </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.hru | toTeraOrGigaOrPeta }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Disk (SSD) </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.sru | toTeraOrGigaOrPeta }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Memory </v-list-item-title>
                </v-list-item-content>
                {{ node.resources.mru | toTeraOrGigaOrPeta }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col :cols="4">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-map-marker</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Location </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Details -->
        <v-row>
          <v-col cols="12">
            <v-list color="transparent">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Country </v-list-item-title>
                </v-list-item-content>
                {{ node.location.country }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> City </v-list-item-title>
                </v-list-item-content>
                {{ node.location.city }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Longitude </v-list-item-title>
                </v-list-item-content>
                {{ node.location.long }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Latitude </v-list-item-title>
                </v-list-item-content>
                {{ node.location.lat }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col :cols="4">
      <v-card flat color="transparent" tag="div">
        <!-- Title -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon size="30" class="mr-2">mdi-silo</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title style="font-size: 20px"> Farm details </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Details -->
        <v-row>
          <v-col cols="12">
            <v-list color="transparent">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> ID </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.id }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Name </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.name }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Certification type </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.farmCertType }}
              </v-list-item>
              <v-divider />

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> Public Ips </v-list-item-title>
                </v-list-item-content>
                {{ node.farm.pubIps }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  name: "NodeDetails",
})
export default class NodeDetails extends Vue {
  @Prop({ required: true }) node!: {
    resources: { cru: string; hru: string; sru: string; mru: string };
    location: { country: string; city: string; long: string; lat: string };
    farm: { id: string; name: string; farmCertType: string; pubIps: string };
  };
  @Prop({ required: true }) byteToGB!: any;
  loading = false;
}
</script>
