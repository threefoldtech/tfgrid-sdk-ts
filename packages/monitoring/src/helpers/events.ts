import chalk from "chalk";
import { EventEmitter } from "events";

import { MonitorEvents } from "../types";

type ServiceStatus = { [key: string]: boolean };

const ALIVE = chalk.green.bold("Alive");
const DOWN = chalk.red.bold("Down");
class MonitorEventEmitter extends EventEmitter {
  private summary: ServiceStatus = {};

  constructor() {
    super();
    this.addListener(MonitorEvents.log, this.monitorLogsHandler);
    this.addListener(MonitorEvents.serviceDown, this.serviceDownHandler);
    this.addListener(MonitorEvents.storeStatus, this.addToServiceSummary);
    this.addListener(MonitorEvents.summarize, this.printStatusSummary);
  }
  public log(message: string, color?: string) {
    this.emit("MonitorLog", message, color);
  }
  public summarize() {
    this.emit("MonitorSummarize");
  }
  public storeStatus(serviceName: string, isAlive: boolean) {
    this.emit("MonitorStoreStatus", serviceName, isAlive);
  }
  public serviceDown(serviceName: string, error?: Error) {
    this.emit("MonitorServiceDown", serviceName, error);
  }

  private monitorLogsHandler(msg: unknown, color?: string) {
    if (color && chalk[color]) {
      console.log(chalk[color](msg));
    } else {
      console.log(msg);
    }
  }
  private serviceDownHandler(serviceName: string, error: Error) {
    console.log(`${chalk.red.bold(serviceName + " is Down")}`);
    console.log(chalk.gray("* Error: " + error.message));
    this.summary[serviceName] = false;
  }

  private addToServiceSummary(serviceName: string, serviceIsAlive: boolean) {
    this.summary[serviceName] = serviceIsAlive;
  }

  private printStatusSummary() {
    const serviceNames = Object.keys(this.summary);
    const maxServiceNameLength = Math.max(...serviceNames.map(entry => entry.length));
    console.log(chalk.blue.bold("Aliveness check summary:"));
    for (const service in this.summary) {
      const padding = " ".repeat(maxServiceNameLength - service.length);
      console.log(`\t${service}${padding}: ${this.summary[service] ? ALIVE : DOWN}`);
    }
  }
}

const monitorEvents = new MonitorEventEmitter();
export { monitorEvents };
