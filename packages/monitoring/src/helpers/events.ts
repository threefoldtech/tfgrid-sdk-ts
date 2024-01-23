import chalk from "chalk";
import { EventEmitter } from "events";

const events = new EventEmitter();
type ServiceStatus = { [key: string]: boolean };

const serviceStatusSummary: ServiceStatus = {};
const ALIVE = chalk.green.bold("Alive");
const DOWN = chalk.red.bold("Down");
function logsHandler(msg) {
  console.log(msg);
}

function serviceDownHandler(serviceName: string, error: Error) {
  console.log(`${chalk.red.bold(serviceName + " is Down")}`);
  console.log(chalk.gray("* Error: " + error.message));
  serviceStatusSummary[serviceName] = false;
}

function addToServiceSummary(serviceName: string, serviceIsAlive: boolean) {
  serviceStatusSummary[serviceName] = serviceIsAlive;
}

function printStatusSummary() {
  const serviceNames = Object.keys(serviceStatusSummary);
  const maxServiceNameLength = Math.max(...serviceNames.map(entry => entry.length));
  console.log(chalk.blue.bold("Aliveness check summary:"));
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
