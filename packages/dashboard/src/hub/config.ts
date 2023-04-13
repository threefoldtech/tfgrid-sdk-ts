import Vue from "vue";
import { toUTC } from "./pipes/toUTC";

Vue.filter("toUTC", toUTC);
