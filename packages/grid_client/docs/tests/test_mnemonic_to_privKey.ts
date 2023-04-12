import { mnemonicToSeedSync } from "bip39";

const seed = mnemonicToSeedSync("miss secret news run cliff lens exist clerk lucky cube fall soldier");
console.log(seed.length);
