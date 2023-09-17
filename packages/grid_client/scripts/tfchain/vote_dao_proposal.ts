import { getClient } from "../client_loader";

async function main() {
  const grid3 = await getClient();
  await grid3.tfchain.tfClient.dao.vote({
    address: "5GNU4aqL9JPj79hUDyPrPPTCpaMcd3LRAmyXvvWUZYtNcLZb",
    farmId: "3876",
    hash: "0xd24a8e1b3c02966d9333f96ba31248aad7e35f52bb3e5f0b24b10748ce03161f",
    approve: true,
  });

  await grid3.disconnect();
}

main();
