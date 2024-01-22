import { EventEmitter } from "events";

import { TextColor } from "../types";
import { colorizeText } from "./utils";
const events = new EventEmitter();

function logsHandler(msg) {
  console.log(msg);
}

function serviceDownHandler(serviceName: string, error: Error) {
  console.log(`${colorizeText(serviceName + " is Down", TextColor.Red)}`);
  console.log(colorizeText("* Error: " + error.message, TextColor.Gray));
}
events.addListener("logs", logsHandler);
events.addListener("serviceIsDown", serviceDownHandler);
export { events };
