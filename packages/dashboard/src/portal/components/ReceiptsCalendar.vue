<template>
  <v-container>
    <v-row class="fill-height">
      <v-col>
        <v-sheet height="64">
          <v-toolbar flat>
            <v-btn outlined @click="setToday">Today</v-btn>
            <v-btn fab text small @click="prev">
              <v-icon small> mdi-chevron-left </v-icon>
            </v-btn>

            <v-toolbar-title v-if="$refs.calendar">
              {{ $refs.calendar.title }}
            </v-toolbar-title>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon small> mdi-chevron-right </v-icon>
            </v-btn>
            <v-btn class="ml-auto" @click="downloadReceipts()">Download Receipts</v-btn>
          </v-toolbar>
        </v-sheet>
        <v-sheet height="600">
          <v-calendar
            ref="calendar"
            v-model="focus"
            :type="type"
            :events="getEvents()"
            @click:event="showEvent"
          ></v-calendar>
        </v-sheet>
      </v-col>
    </v-row>
    <v-dialog v-model="selectedOpen" max-width="600">
      <v-card>
        <v-card-title>
          {{ selectedEvent.name }}
        </v-card-title>
        <v-card-subtitle> {{ selectedEvent.hash }}</v-card-subtitle>
        <v-card-text>
          <p><b>Start:</b> {{ selectedEvent.start }}</p>
          <p><b> End:</b> {{ selectedEvent.end }}</p>

          <p v-if="selectedEvent.tft"><b>TFT:</b>{{ selectedEvent.tft.toFixed(2) }}</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script lang="ts">
import { VueConstructor } from "vue";
import { Component, Vue, Prop, Ref, Watch } from "vue-property-decorator";
import { generateReceipt, getTime, receiptInterface } from "../lib/nodes";
import { jsPDF } from "jspdf";
import { nodeInterface } from "../lib/farms";

interface eventInterface {
  start: Date;
  end: Date;
  name: string;
  color: string;
  hash: string;
  tft?: number;
}
@Component({
  name: "ReceiptsCalendar",
})
export default class ReceiptsCalendar extends Vue {
  $refs!: {
    calendar: any;
  };
  @Ref() calendar!: Vue | VueConstructor<Vue> | Element | (Vue | Element)[] | undefined;

  @Prop({ required: true }) node!: nodeInterface;

  focus = "";
  type = "month";
  selectedElement = null;
  selectedOpen = false;

  selectedEvent: eventInterface = {
    name: "",
    start: new Date(),
    end: new Date(),
    hash: "",
    color: "",
    tft: 0,
  };

  @Watch("receipts") async onPropertyChanged() {
    this.getEvents();
  }
  downloadReceipts() {
    let doc = new jsPDF();
    doc = generateReceipt(doc, this.node);
    doc.save(`node_${this.node.nodeId}_receipts.pdf`);
  }
  getEvents() {
    let events: eventInterface[] = [];
    this.node.receipts.map((rec: receiptInterface) => {
      if (rec.measuredUptime) {
        events.push({
          name: `Minting`,
          start: getTime(rec.mintingStart),
          end: getTime(rec.mintingEnd),
          color: "green",
          hash: rec.hash,
          tft: rec.tft,
        });
      } else {
        events.push({
          name: "Fixup",
          start: getTime(rec.fixupStart),
          end: getTime(rec.fixupEnd),
          color: "red",
          hash: rec.hash,
        });
      }
    });
    return events;
  }

  mounted() {
    this.$refs.calendar.checkChange(); //.checkChange();
  }

  showEvent(event: { event: eventInterface }) {
    this.selectedEvent = event.event;
    this.selectedOpen = true;
  }
  setToday() {
    this.focus = "";
  }
  prev() {
    this.$refs.calendar.prev();
  }
  next() {
    this.$refs.calendar.next();
  }
}
</script>
