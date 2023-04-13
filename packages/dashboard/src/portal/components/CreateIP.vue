<template>
  <v-container>
    <v-dialog v-model="open" width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" v-bind="attrs" v-on="on" :loading="loadingCreate" small> Add IP </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5"> Add Public IP to Farm </v-card-title>

        <v-card-text class="text">
          <v-combobox
            v-model="IPType"
            :items="['Single', 'Range']"
            chips
            label="Choose how to enter IP"
            solo
            type="text"
            @input.native="IPType = $event.srcElement.value"
          >
            <template v-slot:selection="{ attrs, item, select, selected }">
              <v-chip v-bind="attrs" :input-value="selected" @click="select">
                <strong>{{ item }}</strong>
              </v-chip>
            </template>
          </v-combobox>
          <v-form v-model="isValidPublicIP">
            <v-text-field
              :label="IPType === 'Range' ? 'From IP' : 'IP'"
              v-model="publicIP"
              required
              outlined
              dense
              hint="IP address in CIDR format xxx.xxx.xxx.xxx/xx"
              persistent-hint
              :error-messages="ipErrorMessage"
              :rules="[() => !!publicIP || 'This field is required', ipcheck]"
            ></v-text-field>
          </v-form>
          <v-text-field
            v-if="IPType === 'Range'"
            label="To IP"
            v-model="toPublicIP"
            required
            outlined
            dense
            hint="IP address in CIDR format xxx.xxx.xxx.xxx/xx"
            persistent-hint
            :error-messages="toIpErrorMessage"
            :rules="[() => !!toPublicIP || 'This field is required', toIpCheck]"
          ></v-text-field>
          <v-text-field
            label="Gateway"
            v-model="gateway"
            :disabled="!isValidPublicIP"
            required
            outlined
            dense
            hint="Gateway for the IP in ipv4 format"
            persistent-hint
            :error-messages="gatewayErrorMessage"
            :rules="[() => !!gateway || 'This field is required', gatewayCheck]"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-2 black--text" @click="open = false"> Cancel </v-btn>
          <v-btn
            color="primary white--text"
            text
            @click="addIPs()"
            :disabled="
              !!ipErrorMessage ||
              !!gatewayErrorMessage ||
              (IPType == 'Range' && !!toIpErrorMessage) ||
              publicIP === '' ||
              gateway === ''
            "
          >
            Show IPs range
          </v-btn>
          <v-btn
            color="primary white--text"
            text
            @click="createPublicIP()"
            :disabled="
              !!ipErrorMessage ||
              !!gatewayErrorMessage ||
              (IPType == 'Range' && !!toIpErrorMessage) ||
              publicIP === '' ||
              gateway === ''
            "
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showIPs" max-width="500">
      <v-card>
        <v-card-title class="text-h5">IPs range</v-card-title>
        <v-card-text v-for="(IP, i) in IPs" :key="IP">{{ i + 1 }}- {{ IP }}</v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script lang="ts">
/* eslint-disable */
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { getIPRange } from "get-ip-range";
import { default as PrivateIp } from "private-ip";
import { contains } from "cidr-tools";

const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
const ipRegex = new RegExp(`^${IPv4AddressFormat}/(1[6-9]|2[0-9]|3[0-2])$`);
@Component({
  name: "CreateIP",
})
export default class CreateIP extends Vue {
  IPs: Array<string> = [];
  IPType = "Single";
  toPublicIP = "";
  publicIP = "";
  gateway = "";
  toIpErrorMessage = "";
  ipErrorMessage = "";
  gatewayErrorMessage = "";
  open = false;
  showIPs = false;
  inRange: boolean = true;
  isValidPublicIP = false;

  @Prop({ required: true }) loadingCreate!: boolean;
  @Watch("publicIP", { immediate: true })
  @Watch("gateway", { immediate: true })
  onChangeGateway() {
    try {
      this.inRange = contains(this.publicIP, this.gateway);
    } catch (e) {
      this.inRange = false;
    }
    this.gatewayCheck();
  }

  addIPs() {
    this.showIPs = true;
    let sub = this.publicIP.split("/")[1];
    let start = this.publicIP.split("/")[0];
    let end = this.toPublicIP.split("/")[0];

    if (this.IPType == "Single") end = start;

    this.IPs = getIPRange(start, end);
    this.IPs.forEach((ip, i) => {
      this.IPs[i] = ip + "/" + sub;
    });
  }
  createPublicIP() {
    this.addIPs();
    this.showIPs = false;
    this.open = false;

    this.$emit("create", this.IPs, this.gateway);
  }
  toIpCheck() {
    let check_same_IPs = true;
    let check_same_subnet = true;
    let check_from_bigger_than_to = true;
    let check_limit_ips = true;
    let check_ip = true;
    let check_pub_ip = true;
    this.toIpErrorMessage = "";
    if (this.toPublicIP === "") {
      this.toIpErrorMessage = "";
      return true;
    }
    if (!ipRegex.test(this.toPublicIP)) {
      this.toIpErrorMessage = "Incorrect format";
      check_ip = false;
    }

    if (this.toPublicIP.split("/")[1] !== this.publicIP.split("/")[1]) {
      this.toIpErrorMessage = "Subnet is different";
      check_same_subnet = false;
    }

    if (parseInt(this.toPublicIP.split("/")[0].split(".")[3]) <= parseInt(this.publicIP.split("/")[0].split(".")[3])) {
      this.toIpErrorMessage = "To IP must be bigger than From IP";
      check_from_bigger_than_to = false;
    }

    if (
      this.toPublicIP.substring(0, this.toPublicIP.lastIndexOf(".")) !=
      this.publicIP.substring(0, this.publicIP.lastIndexOf("."))
    ) {
      this.toIpErrorMessage = "IPs are not the same";
      check_same_IPs = false;
    }
    if (
      parseInt(this.toPublicIP.split("/")[0].split(".")[3]) - parseInt(this.publicIP.split("/")[0].split(".")[3]) >=
      16
    ) {
      this.toIpErrorMessage = "Range must not exceed 16";
      check_limit_ips = false;
    }
    if (PrivateIp(this.publicIP.split("/")[0])) {
      this.toIpErrorMessage = "IP is not public";
      check_pub_ip = false;
    }
    return (
      check_pub_ip && check_ip && check_same_IPs && check_same_subnet && check_from_bigger_than_to && check_limit_ips
    );
  }
  ipcheck() {
    this.toIpCheck();
    if (PrivateIp(this.publicIP.split("/")[0])) {
      this.ipErrorMessage = "IP is not public";
      return false;
    }
    if (ipRegex.test(this.publicIP)) {
      this.ipErrorMessage = "";
      return true;
    }
    this.ipErrorMessage = "Incorrect format";
    return false;
  }
  gatewayCheck() {
    const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
    const gatewayRegex = new RegExp(`^${IPv4AddressFormat}$`);
    if (this.gateway === "") {
      this.ipErrorMessage = "";
      return true;
    }
    if (!this.inRange) {
      this.gatewayErrorMessage = "Gateway IP not in the provided IP range";
      return false;
    }
    if (gatewayRegex.test(this.gateway)) {
      this.gatewayErrorMessage = "";
      return true;
    } else {
      this.gatewayErrorMessage = "Gateway is not formatted correctly";
      return false;
    }
  }
}
</script>
