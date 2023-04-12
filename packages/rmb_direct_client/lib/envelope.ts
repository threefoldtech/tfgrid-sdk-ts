import { ApiPromise, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { KeypairType } from "@polkadot/util-crypto/types";
import { waitReady } from "@polkadot/wasm-crypto";
import { Buffer } from "buffer";
import * as cryptoJs from "crypto-js";
import aes from "js-crypto-aes";

import { createShared, KPType, sign } from "./sign";
import { Address, Envelope, Error, Request, Response } from "./types/lib/types";
import { getTwinFromTwinID, hexStringToArrayBuffer } from "./util";
class ClientEnvelope extends Envelope {
    signer!: KeyringPair;
    chainUrl: string;
    twin: any;

    constructor(signer: KeyringPair | undefined, envelope: Envelope, chainUrl: string, public api: ApiPromise) {
        super({
            uid: envelope.uid,
            tags: envelope.tags,
            timestamp: envelope.timestamp,
            expiration: envelope.expiration,
            source: envelope.source,
            destination: envelope.destination,
            response: envelope.response,
            request: envelope.request,
            error: envelope.error,
            ping: envelope.ping ? envelope.ping : undefined,
            pong: envelope.pong ? envelope.pong : undefined,
            signature: envelope.signature,
            schema: envelope.schema,
            plain: envelope.plain.length != 0 ? envelope.plain : undefined,
            cipher: envelope.cipher.length != 0 ? envelope.cipher : undefined,
            federation: envelope.federation || undefined,
        });

        this.chainUrl = chainUrl;
        this.schema = "application/json";
        this.api = api;

        if (signer) {
            this.signer = signer;
        }
    }
    signEnvelope() {
        const toSign = this.challenge();
        return sign(toSign, this.signer);
    }

    createNonce(size: number) {
        const randArr: number[] = [];
        for (let i = 0; i < size; i++) {
            randArr.push(Math.random() * 10);
        }
        return new Uint8Array([...randArr]);
    }

    async getSigner(sigType: KeypairType) {
        await waitReady();

        const keyring = new Keyring({ type: sigType });
        this.signer = keyring.addFromAddress(this.twin.accountId);
    }

    async verify() {
        try {
            const prefix = new TextDecoder().decode(this.signature.slice(0, 1));
            let sigType: KeypairType;
            if (prefix == "e") {
                sigType = KPType.ed25519;
            } else if (prefix == "s") {
                sigType = KPType.sr25519;
            } else {
                return false;
            }
            // get twin of sender from twinid

            this.twin = await getTwinFromTwinID(this.api, this.source.twin);

            // get sender pk from twin , update signer to be of sender
            await this.getSigner(sigType);
            // verify signature using challenge and pk
            const dataHashed = new Uint8Array(this.challenge());

            return this.signer.verify(dataHashed, this.signature.slice(1), this.signer.publicKey);
        } catch (err) {
            console.log("invalid destination twin", err);
        }
    }

    async encrypt(requestData: any, mnemonic: string, destTwinPk: string) {
        const pubKey = new Uint8Array(hexStringToArrayBuffer(destTwinPk));
        const sharedKey = await createShared(pubKey, mnemonic);

        const nonce = this.createNonce(12);

        // convert requestdata to Uint8Array
        const dataUint8 = new Uint8Array(Buffer.from(requestData));

        // encrypt cipher text with sharedkey

        const encryptedText = await aes.encrypt(dataUint8, sharedKey, { name: "AES-GCM", iv: nonce });

        const encryptedArr = new Uint8Array(encryptedText);
        const finalArr = new Uint8Array(encryptedArr.length + nonce.length);
        finalArr.set(nonce);
        finalArr.set(encryptedArr, nonce.length);

        return finalArr;
    }
    // needs to return wordArray decrypted
    async decrypt(mnemonic: string) {
        const pubKey = new Uint8Array(hexStringToArrayBuffer(this.twin.pk));
        const sharedKey = await createShared(pubKey, mnemonic);
        const iv = this.cipher.slice(0, 12);
        const data = Buffer.from(this.cipher.slice(12));
        const decrypted = await aes.decrypt(data, sharedKey, { name: "AES-GCM", iv });
        return decrypted;
    }
    challenge() {
        let hash = cryptoJs.algo.MD5.create()
            .update(this.uid)
            .update(this.tags)
            .update(`${this.timestamp}`)
            .update(`${this.expiration}`)
            .update(this.challengeAddress(this.source))
            .update(this.challengeAddress(this.destination));

        if (this.request) {
            hash = this.challengeRequest(this.request, hash);
        } else if (this.response) {
            hash = this.challengeResponse(this.response, hash);
        } else if (this.error) {
            hash = this.challengeError(this.error, hash);
        }

        if (this.schema) {
            hash.update(this.schema);
        }
        if (this.federation) {
            hash.update(this.federation);
        }

        if (this.plain.length > 0) {
            const plain = Buffer.from(this.plain).toString("hex");
            hash.update(cryptoJs.enc.Hex.parse(plain));
        } else if (this.cipher.length > 0) {
            const cipher = Buffer.from(this.cipher).toString("hex");
            hash.update(cryptoJs.enc.Hex.parse(cipher));
        }

        const hashFinal = Buffer.from(hash.finalize().toString(), "hex");

        return hashFinal;
    }
    challengeAddress(address: Address) {
        return `${address.twin}${address.connection}`;
    }
    challengeError(err: Error, hash) {
        return hash.update(`${err.code}${err.message}`);
    }
    challengeRequest(request: Request, hash) {
        return hash.update(request.command);
    }
    challengeResponse(response: Response, hash) {
        // to be implemented
        return hash;
    }
}
export default ClientEnvelope;
