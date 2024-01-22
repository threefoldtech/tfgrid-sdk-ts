import { EventEmitter } from "events";

import { TextColor } from "../types";
import { colorizeText } from "./utils";
const events = new EventEmitter();
type ServiceStatus = { [key: string]: boolean };

const serviceStatusSummary: ServiceStatus = {};
const ALIVE = colorizeText("Alive", TextColor.Green);
const DOWN = colorizeText("Down", TextColor.Red);
function logsHandler(msg) {
  console.log(msg);
}

function serviceDownHandler(serviceName: string, error: Error) {
  console.log(`${colorizeText(serviceName + " is Down", TextColor.Red)}`);
  console.log(colorizeText("* Error: " + error.message, TextColor.Gray));
  serviceStatusSummary[serviceName] = false;
}

function addToServiceSummary(serviceName: string, serviceIsAlive: boolean) {
  serviceStatusSummary[serviceName] = serviceIsAlive;
}

function printStatusSummary() {
  const serviceNames = Object.keys(serviceStatusSummary);
  const maxServiceNameLength = Math.max(...serviceNames.map(entry => entry.length));
  console.log(colorizeText("Aliveness check summary:", TextColor.Blue));
  for (const service in serviceStatusSummary) {
    const padding = " ".repeat(maxServiceNameLength - service.length);
    console.log(`\t${service}${padding}: ${serviceStatusSummary[service] ? ALIVE : DOWN}`);
  }
}
events.addListener("logs", logsHandler);
events.addListener("serviceIsDown", serviceDownHandler);
events.addListener("storeServiceStatus", addToServiceSummary);
events.addListener("summarize", printStatusSummary);
export { events };
