import { HealthCheckers } from "../src/index";
async function HealthCheck() {
  const tfChain = new HealthCheckers.TFChainHealthCheck("wss://<chain_url>");
  try {
    await tfChain.alive();
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
