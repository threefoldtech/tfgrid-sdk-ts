import { servicesLiveChecker } from "../src/index";
async function HealthCheck() {
  try {
    console.log(await servicesLiveChecker("heiaw", "", "wss://tfchain.dev.grid.tf/ws", "wss://relay.dev.grid.tf"));
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
