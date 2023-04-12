
import { GridClient, NetworkEnv, BackendStorageType, KeypairType } from "../../src";

async function getClient() {
    const gridClient = new GridClient({ network: NetworkEnv.dev, mnemonic: "rely regret impact scan inner kiss exit demand ladder achieve amazing endless" });
    await gridClient.connect();
    const x = await gridClient.balance.getMyBalance()
    console.log(x)
    console.log(await gridClient.balance.transfer({ address: "5Fpj5MhLiC2cQk8uhzch9EdKggZYhShRHesN14V5vXcdLAbP", amount: 1 }));
    const y = await gridClient.balance.getMyBalance()
    console.log(y)
    console.log(x.free - y.free)

    gridClient.disconnect();
}
getClient();

