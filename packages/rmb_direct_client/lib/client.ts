import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { KeypairType } from "@polkadot/util-crypto/types";
import { waitReady } from "@polkadot/wasm-crypto";
import { Client as TFClient, Twin } from "@threefold/tfchain_client";
import {
  BaseError,
  ConnectionError,
  InsufficientBalanceError,
  InvalidResponse,
  RMBError,
  TimeoutError,
  TwinNotExistError,
  ValidationError,
} from "@threefold/types";
import AwaitLock from "await-lock";
import base64url from "base64url";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";
import type { WebSocket as WSConnection } from "ws";

import ClientEnvelope from "./envelope";
import { KPType, sign } from "./sign";
import { Address, Envelope, Ping, Request } from "./types/lib/types";
import { generatePublicKey, getTwin } from "./util";

class Client {
  static connections = new Map<string, Client>();
  static connectingLock = new AwaitLock();
  signer!: KeyringPair;
  source: Address = new Address();
  responses = new Map<string, ClientEnvelope>();
  con!: WSConnection;
  twin: any;
  destTwin: any;
  tfclient: TFClient;
  twins = new Map<number, { twin: Twin; timestamp: number }>();

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
      throw new ValidationError("Unsupported Keypair type");
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
        const castedEnvelope = new ClientEnvelope(
          undefined,
          receivedEnvelope,
          this.chainUrl,
          this.tfclient,
          this.twins,
        );

        //verify
        if (this.responses.get(receivedEnvelope.uid)) {
          // update envelope in responses map
          this.responses.set(receivedEnvelope.uid, castedEnvelope);
        }
      };
    } catch (err) {
      throw new ConnectionError(`Unable to create websocket connection due to ${err}`);
    }
  }
  async connect() {
    try {
      await Client.connectingLock.acquireAsync();
      if (this.con && this.con.readyState === this.con.OPEN) return;
      await this.tfclient.connect();
      await this.createSigner();

      const twinId = await this.tfclient.twins.getTwinIdByAccountId({ accountId: this.signer.address });
      if (!twinId) {
        throw new TwinNotExistError(`Couldn't find a user for the provided mnemonic on this network.`);
      }

      this.twin = await this.tfclient.twins.get({ id: twinId });
      this.twins.set(this.twin.id, { twin: this.twin, timestamp: Math.round(Date.now() / 1000) });
      try {
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
        const relayHostName = this.relayUrl.replace("wss://", "").replace("/", "");
        const pk = generatePublicKey(this.mnemonics);
        if (this.twin.pk !== pk || this.twin.relay !== relayHostName) {
          await (await this.tfclient.twins.update({ pk, relay: relayHostName })).apply();
          this.twin.pk = pk;
        }
      } catch (err) {
        if (err instanceof InsufficientBalanceError) throw err;
        this.disconnect();
        if (err instanceof TwinNotExistError) throw err;
        if (err instanceof BaseError) {
          err.message = `Unable to establish a connection with the RMB server ${this.relayUrl.replace(
            "wss://",
            "",
          )}\n\t${
            err.message
          }\n\tPlease check your internet connection and try again. If the problem persists, please contact our support.`;
          throw err;
        }
        throw new RMBError(
          `Unable to establish a connection with the RMB server ${this.relayUrl.replace(
            "wss://",
            "",
          )}. Please check your internet connection and try again. If the problem persists, please contact our support.`,
        );
      }
    } finally {
      Client.connectingLock.release();
    }
  }

  private logPendingResponses() {
    console.debug("Waiting for the rmb responses to be received before closing the connection");
    for (const id of this.responses.keys()) {
      const envelope = this.responses.get(id);
      if (envelope?.request) {
        console.debug(`- Response for ${envelope?.request.command} from twin ${envelope?.destination}`);
      }
    }
  }

  private async waitForResponses(timeoutInSeconds = 2 * 60): Promise<void> {
    const start = new Date().getTime();
    while (new Date().getTime() < start + timeoutInSeconds * 1000) {
      if (this.responses.size === 0) return;
      this.logPendingResponses();
      await new Promise(f => setTimeout(f, 1000));
    }
    this.responses.clear();
  }

  async disconnect() {
    if (this.__pingPongTimeout) clearTimeout(this.__pingPongTimeout);
    this.con.removeAllListeners();
    await this.waitForResponses();
    await this.tfclient.disconnect();
    if (this.con?.readyState !== this.con?.CLOSED) this.con.close();
  }

  disconnectAndExit() {
    if (this.__pingPongTimeout) clearTimeout(this.__pingPongTimeout);
    for (const connection of Client.connections.values()) {
      connection.con.close();
    }
    process.removeAllListeners();
    process.exit(0);
  }

  reconnect() {
    this.connect();
  }
  waitForOpenConnection() {
    return new Promise((resolve, reject) => {
      const maxNumberOfAttempts = 20;
      const intervalTime = 500; //ms

      let currentAttempt = 0;
      const interval = setInterval(() => {
        if (currentAttempt > maxNumberOfAttempts - 1) {
          clearInterval(interval);
          reject(new ConnectionError("Maximum number of attempts exceeded"));
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
      const clientEnvelope = new ClientEnvelope(this.signer, envelope, this.chainUrl, this.tfclient, this.twins);

      let retriesCount = 0;
      while (this.con.readyState != this.con.OPEN && retries >= retriesCount++) {
        try {
          await this.waitForOpenConnection();
        } catch (er) {
          if (retries === retriesCount) {
            throw new ConnectionError(`Failed to open connection after try for ${retriesCount} times.`);
          }
          this.createConnection();
        }
      }

      // add request id to responses map on client object
      this.responses.set(clientEnvelope.uid, clientEnvelope);

      this.con.send(clientEnvelope.serializeBinary());

      return clientEnvelope.uid;
    } catch (err) {
      throw new RMBError(`Unable to send due to ${err}`);
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
      this.destTwin = await getTwin(destinationTwinId, this.twins, this.tfclient);

      // create new envelope with given data and destination
      const envelope = new Envelope({
        uid: uuidv4(),
        timestamp: Math.round(Date.now() / 1000),
        expiration: expirationMinutes * 60,
        source: this.source,
      });
      envelope.destination = new Address({ twin: this.destTwin.id });

      if (requestCommand) {
        envelope.request = new Request({ command: requestCommand });
      }

      const clientEnvelope = new ClientEnvelope(this.signer, envelope, this.chainUrl, this.tfclient, this.twins);
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
            throw new ConnectionError(`Failed to open connection after try for ${retriesCount} times.`);
          }
          this.createConnection();
        }
      }

      // add request id to responses map on client object
      this.responses.set(clientEnvelope.uid, clientEnvelope);

      this.con.send(clientEnvelope.serializeBinary());

      return clientEnvelope.uid;
    } catch (err) {
      throw new RMBError(`Unable to send due to ${err}`);
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
            reject(new InvalidResponse("invalid signature, discarding response"));
            break;
          }
        }
        // check if envelope in map has an error
        else if (envelope && envelope.error) {
          const err = envelope.error;
          if (err) {
            this.responses.delete(requestID);
            reject(new RMBError(`${err.code} ${err.message}`));
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
        reject(new TimeoutError(`Didn't get a response after ${envelope.expiration} seconds`));
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
    this.signer = keyring.addFromUri(this.mnemonics);
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
