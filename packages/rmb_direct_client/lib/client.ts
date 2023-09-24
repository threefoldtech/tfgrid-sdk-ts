import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { KeypairType } from "@polkadot/util-crypto/types";
import { waitReady } from "@polkadot/wasm-crypto";
import { Client as TFClient } from "@threefold/tfchain_client";
import base64url from "base64url";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";
import type { WebSocket as WSConnection } from "ws";

import ClientEnvelope from "./envelope";
import { KPType, sign } from "./sign";
import { Address, Envelope, Error, Ping, Pong, Request } from "./types/lib/types";
import { generatePublicKey } from "./util";

class Client {
  static connections = new Map<string, Client>();
  signer!: KeyringPair;
  source: Address = new Address();
  responses = new Map<string, ClientEnvelope>();
  con!: WSConnection;
  twin: any;
  destTwin: any;
  tfclient: TFClient;

  constructor(
    public chainUrl: string,
    public relayUrl: string,
    public mnemonics: string,
    public session: string,
    public keypairType: KeypairType,
    public retries: number,
  ) {
    this.disconnectAndExit = this.disconnectAndExit.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.retries = retries > 0 ? retries : 5;

    const key = `${this.relayUrl}:${this.mnemonics}:${this.keypairType}`;
    if (Client.connections.has(key)) {
      return Client.connections.get(key) as Client;
    }

    if (!(keypairType.toLowerCase().trim() in KPType)) {
      throw new Error({ message: "Unsupported Keypair type" });
    }

    Client.connections.set(key, this);
    this.tfclient = new TFClient({ url: chainUrl, mnemonicOrSecret: mnemonics, keypairType: keypairType });
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
        await this.tfclient?.connect();
        const castedEnvelope = new ClientEnvelope(undefined, receivedEnvelope, this.chainUrl, this.tfclient);

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
      await this.tfclient.connect();
      await this.createSigner();
      const twinId = await this.tfclient.twins.getTwinIdByAccountId({ accountId: this.signer.address });
      this.twin = await this.tfclient.twins.get({ id: twinId });
      if (!twinId) {
        throw new Error({ message: `Couldn't find a user for the provided mnemonic on this network.` });
      }
    } catch (e) {
      console.log(e);
      throw new Error({ message: `Couldn't find a user for the provided mnemonic on this network.` });
    }

    try {
      if (!this.twin) {
        throw new Error({ message: "twin does not exist, please create a twin first" });
      }
      const pk = generatePublicKey(this.mnemonics);
      if (this.twin.pk !== pk) {
        await (
          await this.tfclient.twins.update({ pk, relay: this.relayUrl.replace("wss://", "").replace("/", "") })
        ).apply();
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
      console.log(err);
      throw new Error({
        message: `Unable to establish a connection with the RMB server. Please check your internet connection and try again. If the problem persists, please contact our support.`,
      });
    }
  }

  disconnect() {
    this.tfclient.disconnect();
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
    this.tfclient.disconnect();
    if (this.con?.readyState !== this.con?.CLOSED) this.con.close();
  }
  waitForOpenConnection() {
    return new Promise((resolve, reject) => {
      const maxNumberOfAttempts = 20;
      const intervalTime = 500; //ms

      let currentAttempt = 0;
      const interval = setInterval(() => {
        if (currentAttempt > maxNumberOfAttempts - 1) {
          clearInterval(interval);
          reject(new Error({ message: "Maximum number of attempts exceeded" }));
        } else if (this.con && this.con.readyState === this.con.OPEN) {
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

      envelope.destination = new Address();
      const clientEnvelope = new ClientEnvelope(this.signer, envelope, this.chainUrl, this.tfclient);

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
      this.destTwin = await this.tfclient.twins.get({ id: destinationTwinId });
      envelope.destination = new Address({ twin: this.destTwin.id });

      if (requestCommand) {
        envelope.request = new Request({ command: requestCommand });
      }

      const clientEnvelope = new ClientEnvelope(this.signer, envelope, this.chainUrl, this.tfclient);
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
}
export { Client };
