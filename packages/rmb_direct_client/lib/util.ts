import * as secp from "@noble/secp256k1";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/api";
import { KeypairType } from "@polkadot/util-crypto/types";
import * as bip39 from "bip39";
import * as cryptoJs from "crypto-js";
export async function createGridCL(chainUrl: string) {
    const provider = new WsProvider(chainUrl);
    const cl = await ApiPromise.create({ provider });
    return cl;
}

export function generatePublicKey(mnemonic: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const privKey = new Uint8Array(seed).slice(0, 32);
    const pk = "0x" + Buffer.from(secp.getPublicKey(privKey, true)).toString("hex");
    return pk;
}

export async function setPublicKey(
    mnemonic: string,
    pk: string,
    api: ApiPromise,
    relay: string,
    scheme: KeypairType,
    callback: any,
) {
    relay = relay.replace("wss://", "").replace("/", "");
    const keyring = new Keyring({ type: scheme });
    const key = keyring.addFromUri(mnemonic);
    const nonce = await api.rpc.system.accountNextIndex(key.address);
    return api.tx.tfgridModule.updateTwin(relay, pk).signAndSend(key, { nonce }, callback);
}

export async function getTwinFromTwinID(api: ApiPromise, twinId: number) {
    return (await api.query.tfgridModule.twins(twinId)).toJSON();
}

export async function getTwinFromTwinAddress(api: ApiPromise, address: string) {
    const twinId = await api.query.tfgridModule.twinIdByAccountID(address);
    return (await api.query.tfgridModule.twins(Number(twinId))).toJSON();
}

export function hexStringToArrayBuffer(hexString) {
    // remove the leading 0x
    hexString = hexString.replace(/^0x/, "");

    // ensure even number of characters
    if (hexString.length % 2 != 0) {
        console.log("WARNING: expecting an even number of characters in the hexString");
    }

    // check for some non-hex characters
    const bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
        console.log("WARNING: found non-hex characters", bad);
    }

    // split the string into pairs of octets
    const pairs = hexString.match(/[\dA-F]{2}/gi);

    // convert the octets to integers
    const integers = pairs.map(function (s) {
        return parseInt(s, 16);
    });

    const array = new Uint8Array(integers);

    return array.buffer;
}

export function wordArrayToUint8Array(data: cryptoJs.lib.WordArray) {
    const dataArray = new Uint8Array(data.sigBytes);
    for (let i = 0x0; i < data.sigBytes; i++) {
        dataArray[i] = (data.words[i >>> 0x2] >>> (0x18 - (i % 0x4) * 0x8)) & 0xff;
    }
    return new Uint8Array(dataArray);
}

export async function applyExtrinsic(func: any, args: any[]) {
    return new Promise(async (resolve, reject) => {
        function callback(res) {
            if (res instanceof Error) {
                console.error(res);
                reject(res);
            }
            const { events = [], status } = res;
            if (status.isFinalized) {
                events.forEach(({ phase, event: { data, method, section } }) => {
                    console.log(`phase: ${phase}, section: ${section}, method: ${method}`);
                    if (section === "system" && method === "ExtrinsicFailed") {
                        reject(`Failed to apply ${func.name} in module 'system' with ${args.slice(0, -1)}`);
                    } else if (section === "system" && method === "ExtrinsicSuccess") {
                        resolve(data.toJSON()[0]);
                    }
                });
            }
        }
        try {
            args.push(callback);
            await func.apply(null, args);
        } catch (e) {
            reject(e);
        }
    });
}
