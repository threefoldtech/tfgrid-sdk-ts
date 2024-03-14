<template>
  <img v-if="src" :src="src" alt="qrcode" />
</template>

<script lang="ts">
import qrcode from "qrcode";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "QrcodeGenerator",
})
export default class QrcodeGenerator extends Vue {
  @Prop({ required: true }) data!: string;

  public src = "";

  async mounted() {
    this.src = await qrcode.toDataURL(this.data, { width: 250 });
  }
}
</script>
