<template>
  <div style="display: flex">
    <div style="width: 100px">
      <v-select label="OS" :items="['windows', 'darwin', 'linux']" v-model="os" />
    </div>
    <div style="width: 100px" class="mr-2 ml-2">
      <v-select label="Arch" :items="['amd64', 'arm', 'arm64', 'i386']" v-model="arch" />
    </div>
    <v-text-field label="Url" v-model="url" />
    <v-btn fab small color="error" class="ml-2" @click="$emit('on:remove')" v-if="removable">
      <v-icon> mdi-minus </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component({
  name: "OsInput",
})
export default class OsInput extends Vue {
  @Prop({ default: false }) removable!: boolean;
  @Prop({ required: false }) value!: any;

  os = null;
  arch = null;
  url = null;

  get osInfo() {
    const { os, arch, url } = this;
    return { os, arch, url };
  }

  @Watch("os")
  @Watch("arch")
  @Watch("url")
  onUpdateValue() {
    this.$emit("input", this.osInfo);
  }
}
</script>
