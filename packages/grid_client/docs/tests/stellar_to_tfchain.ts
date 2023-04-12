import { Keyring } from "@polkadot/keyring";
import {} from "@polkadot/util-crypto";
import { waitReady } from "@polkadot/wasm-crypto";
import { entropyToMnemonic } from "bip39";
import { Keypair } from "stellar-sdk";

async function main() {
    const stellarSecret = Keypair.fromSecret("SACLKHTVC3K36GCW6EPN7DAXNLLWPWLSFDAMM4EV22KRF62JK342QISI");
    const stellarSeed = stellarSecret.rawSecretKey();
    console.log("seed:", `0x${stellarSeed.toString("hex")}`);
    const keyring = new Keyring({ type: "sr25519" });
    await waitReady();
    const key = keyring.addFromSeed(stellarSeed);
    console.log("address:", key.address);
}
main();
