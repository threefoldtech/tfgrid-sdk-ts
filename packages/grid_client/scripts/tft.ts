import { TFT } from "../src";

const tft = new TFT("wss://tfchain.dev.grid.tf/ws");

async function main() {
  const price = await tft.tftPrice();
  console.log(price);
}

main();
