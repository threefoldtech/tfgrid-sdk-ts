import { Keyring } from "@polkadot/api";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { KeypairType } from "@polkadot/util-crypto/types";
import { waitReady } from "@polkadot/wasm-crypto";
import base64url from "base64url";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";
import type { WebSocket as WSConnection } from "ws";

import ClientEnvelope from "./envelope";
import { KPType, sign } from "./sign";
import { Address, Envelope, Error, Ping, Pong, Request } from "./types/lib/types";
import { applyExtrinsic, generatePublicKey, getTwinFromTwinAddress, getTwinFromTwinID, setPublicKey } from "./util";

class Client {
    static connections = new Map<string, Client>();
    signer!: KeyringPair;
    source: Address = new Address();
    responses = new Map<string, ClientEnvelope>();
    con!: WSConnection;
    twin: any;
    destTwin: any;

    constructor(
        public chainUrl: string,
        public relayUrl: string,
        public mnemonics: string,
        public session: string,
        public keypairType: KeypairType,
        public retries: number,
        public api?: ApiPromise,
    ) {
        this.disconnectAndExit = this.disconnectAndExit.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.__handleConnection = this.__handleConnection.bind(this);
        this.retries = retries > 0 ? retries : 5;

        const key = `${this.relayUrl}:${this.mnemonics}:${this.keypairType}`;
        if (Client.connections.has(key)) {
            return Client.connections.get(key) as Client;
        }

        if (!(keypairType.toLowerCase().trim() in KPType)) {
            throw new Error({ message: "Unsupported Keypair type" });
        }

        Client.connections.set(key, this);
    }

    private __pingPongTimeout?: NodeJS.Timeout;
    private async __pingPong() {
        if (this.__pingPongTimeout) clearTimeout(this.__pingPongTimeout);
        const reqId = await this.ping();
        return this.read(reqId)
            .catch(() => this.reconnect())
            .finally(() => {
                this.__pingPongTimeout = setTimeout(() => {
                    if (this.con?.readyState === this.con?.OPEN) this.__pingPong();
                }, 20 * 1000);
            });
    }

    createConnection() {
        if (this.con?.readyState !== this.con?.CLOSED) {
            this.con.close();
        }

        try {
            if (this.isEnvNode()) {
                const Ws = require("ws");
                this.con = new Ws(this.updateUrl());
            } else {
                this.con = new WebSocket(this.updateUrl()) as unknown as WSConnection;
            }
            this.con.onmessage = async (e: any) => {
                let data: Uint8Array = e.data;
                if (!this.isEnvNode()) {
                    const buffer = await new Response(e.data).arrayBuffer();
                    data = new Uint8Array(buffer);
                }
                const receivedEnvelope = Envelope.deserializeBinary(data);
                // cast received enevelope to client envelope

                await this._initApi();
                const castedEnvelope = new ClientEnvelope(undefined, receivedEnvelope, this.chainUrl, this.api!);

                //verify
                if (this.responses.get(receivedEnvelope.uid)) {
                    // update envelope in responses map
                    this.responses.set(receivedEnvelope.uid, castedEnvelope);
                }
            };
        } catch (err) {
            throw new Error({ message: `Unable to create websocket connection due to ${err}` });
        }
    }
    async connect() {
        if (this.con) return;

        try {
            await this._initApi();
            await this.createSigner();
            this.twin = await getTwinFromTwinAddress(this.api!, this.signer.address);
            if (!this.twin) {
                throw new Error({ message: "twin does not exist, please create a twin first" });
            }
            if (!this.twin.pk) {
                const pk = generatePublicKey(this.mnemonics);
                await applyExtrinsic(setPublicKey, [this.mnemonics, pk, this.api!, this.relayUrl, this.keypairType]);
                this.twin.pk = pk;
            }

            this.updateSource();
            this.createConnection();
            await this.waitForOpenConnection();
            this.__pingPong();

            if (this.isEnvNode()) {
                process.on("SIGTERM", this.disconnectAndExit);
                process.on("SIGINT", this.disconnectAndExit);
                process.on("SIGUSR1", this.disconnectAndExit);
                process.on("SIGUSR2", this.disconnectAndExit);
            } else {
                window.onbeforeunload = () => {
                    return "";
                };
                window.onunload = this.disconnect;
            }
        } catch (err) {
            const c = this.con as WSConnection;
            if (c && c.readyState == c.OPEN) {
                c.close();
            }
            throw new Error({ message: `Unable to connect due to ${err.message}` });
        }
    }

    disconnect() {
        this.api?.off("disconnected", this.__handleConnection);
        this.api?.disconnect();
        for (const connection of Client.connections.values()) {
            connection.con.close();
        }
    }

    disconnectAndExit() {
        this.disconnect();
        process.exit(0);
    }

    reconnect() {
        this.connect();
    }
    close() {
        if (this.__pingPongTimeout) clearTimeout(this.__pingPongTimeout);
        this.api?.off("disconnected", this.__handleConnection);
        if (this.api?.isConnected) this.api?.disconnect();
        if (this.con?.readyState !== this.con?.CLOSED) this.con.close();
    }
    waitForOpenConnection() {
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 10;
            const intervalTime = 100; //ms

            let currentAttempt = 0;
            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval);
                    reject(new Error({ message: "Maximum number of attempts exceeded" }));
                } else if (this.con.readyState === this.con.OPEN) {
                    clearInterval(interval);
                    resolve("connected");
                }
                currentAttempt++;
            }, intervalTime);
        });
    }
    // send ping every 20 s
    async ping(retries: number = this.retries) {
        try {
            // create new envelope with given data and destination
            const envelope = new Envelope({
                uid: uuidv4(),
                timestamp: Math.round(Date.now() / 1000),
                expiration: 40,
                source: this.source,
                ping: new Ping(),
            });
            // need to check if destination twinId exists by fetching dest twin from chain first
            await this._initApi();

            envelope.destination = new Address();
            const clientEnvelope = new ClientEnvelope(this.signer, envelope, this.chainUrl, this.api!);

            let retriesCount = 0;
            while (this.con.readyState != this.con.OPEN && retries >= retriesCount++) {
                try {
                    await this.waitForOpenConnection();
                } catch (er) {
                    if (retries === retriesCount) {
                        const e = new Error();
                        e.message = `Failed to open connection after try for ${retriesCount} times.`;
                        throw e;
                    }
                    this.createConnection();
                }
            }

            // add request id to responses map on client object
            this.responses.set(clientEnvelope.uid, clientEnvelope);

            this.con.send(clientEnvelope.serializeBinary());

            return clientEnvelope.uid;
        } catch (err) {
            throw new Error({ message: `Unable to send due to ${err}` });
        }
    }

    async send(
        requestCommand: string,
        requestData: any,
        destinationTwinId: number,
        expirationMinutes: number,
        retries: number = this.retries,
    ) {
        try {
            // create new envelope with given data and destination
            const envelope = new Envelope({
                uid: uuidv4(),
                timestamp: Math.round(Date.now() / 1000),
                expiration: expirationMinutes * 60,
                source: this.source,
            });
            // need to check if destination twinId exists by fetching dest twin from chain first
            await this._initApi();
            this.destTwin = await getTwinFromTwinID(this.api!, destinationTwinId);

            envelope.destination = new Address({ twin: this.destTwin.id });

            if (requestCommand) {
                envelope.request = new Request({ command: requestCommand });
            }

            const clientEnvelope = new ClientEnvelope(this.signer, envelope, this.chainUrl, this.api!);
            let retriesCount = 0;

            if (requestData) {
                if (this.destTwin.pk && this.twin.pk) {
                    clientEnvelope.cipher = await clientEnvelope.encrypt(requestData, this.mnemonics, this.destTwin.pk);
                } else {
                    clientEnvelope.plain = new Uint8Array(Buffer.from(requestData));
                }
            }

            if (this.signer) {
                clientEnvelope.signature = clientEnvelope.signEnvelope();
            }

            while (this.con.readyState != this.con.OPEN && retries >= retriesCount++) {
                try {
                    await this.waitForOpenConnection();
                } catch (er) {
                    if (retries === retriesCount) {
                        const e = new Error();
                        e.message = `Failed to open connection after try for ${retriesCount} times.`;
                        throw e;
                    }
                    this.createConnection();
                }
            }

            // add request id to responses map on client object
            this.responses.set(clientEnvelope.uid, clientEnvelope);

            this.con.send(clientEnvelope.serializeBinary());

            return clientEnvelope.uid;
        } catch (err) {
            throw new Error({ message: `Unable to send due to ${err}` });
        }
    }
    // if pong is received reset timer (40 seconds)
    // if no pong receieved after 40 s, reconnect
    read(requestID: string) {
        return new Promise(async (resolve, reject) => {
            let envelope = this.responses.get(requestID) as ClientEnvelope;
            // check if envelope in map has a response
            const now = new Date().getTime();
            while (envelope && new Date().getTime() < now + envelope.expiration * 1000) {
                envelope = this.responses.get(requestID) as ClientEnvelope;
                if (envelope && envelope.response) {
                    const verified = await envelope.verify();
                    if (verified) {
                        if (envelope.plain.length > 0) {
                            const dataReceived = envelope.plain;
                            if (dataReceived) {
                                const decodedData = new TextDecoder("utf8").decode(Buffer.from(dataReceived));
                                const parsedResponse = JSON.parse(decodedData);
                                this.responses.delete(requestID);
                                resolve(parsedResponse);
                                break;
                            }
                        } else if (envelope.cipher.length > 0) {
                            const decryptedCipher = await envelope.decrypt(this.mnemonics);
                            const decodedData = Buffer.from(decryptedCipher).toString();
                            const parsedResponse = JSON.parse(decodedData);
                            this.responses.delete(requestID);
                            resolve(parsedResponse);
                            break;
                        }
                    } else {
                        this.responses.delete(requestID);
                        reject("invalid signature, discarding response");
                        break;
                    }
                }
                // check if envelope in map has an error
                else if (envelope && envelope.error) {
                    const err = envelope.error;
                    if (err) {
                        this.responses.delete(requestID);
                        reject(`${err.code} ${err.message}`);
                        break;
                    }
                } else if (envelope && envelope.pong) {
                    this.responses.delete(requestID);
                    resolve(envelope.pong);
                    break;
                }
                await new Promise(f => setTimeout(f, 1000));
            }
            if (envelope && envelope.expiration) {
                this.responses.delete(requestID);
                reject(`Didn't get a response after ${envelope.expiration} seconds`);
            }
        });
    }

    isEnvNode(): boolean {
        return (
            typeof process === "object" &&
            typeof process.versions === "object" &&
            typeof process.versions.node !== "undefined"
        );
    }

    async createSigner() {
        await waitReady();
        const keyring = new Keyring({ type: this.keypairType });
        this.signer = keyring.addFromMnemonic(this.mnemonics);
    }
    updateSource() {
        this.source.twin = this.twin.id;
        this.source.connection = this.session;
    }
    newJWT(session: string) {
        const header = {
            alg: "RS512",
            typ: "JWT",
        };

        const now = Math.ceil(Date.now().valueOf() / 1000);
        const claims = {
            sub: this.twin.id,
            iat: now,
            exp: now + 1000,
            sid: session,
        };
        const jwt = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(claims));

        const sigPrefixed = sign(jwt, this.signer);
        const token = jwt + "." + base64url(Buffer.from(sigPrefixed));
        return token;
    }
    updateUrl() {
        // create token from identity
        const token = this.newJWT(this.session);

        // update url with token
        return `${this.relayUrl}?${token}`;
    }

    private async _initApi(): Promise<void> {
        if (this.api) return;

        const provider = new WsProvider(this.chainUrl);
        this.api = await ApiPromise.create({ provider });
        this.api.on("disconnected", this.__handleConnection);
    }

    private __handleConnection() {
        this.api?.connect();
    }
}
export { Client };
