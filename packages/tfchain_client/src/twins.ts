import { TwinNotExistError } from "@threefold/types";

import { Client, QueryClient } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

interface Twin {
  id: number;
  accountId: string;
  relay: string;
  entities: string[];
  pk: string;
}

interface QueryTwinsGetOptions {
  id: number;
}

interface QueryTwinsGetTwinByAccountIdOptions {
  accountId: string;
}

class QueryTwins {
  /**
   * Represents a class for querying twin information.
   */
  constructor(public client: QueryClient) {
    this.client = client;
  }

  /**
   * Retrieves twin information based on the provided options.
   *
   * @param options - The options for querying the twin, including the `twin ID`.
   * @returns {Promise<Twin>} A Promise that resolves to the twin information.
   * @throws {`TwinNotExistError`} if the provided `twin ID` is not a positive integer.
   */
  @checkConnection
  async get(options: QueryTwinsGetOptions): Promise<Twin> {
    if (isNaN(options.id) || options.id <= 0) {
      throw new TwinNotExistError("Invalid twin id. Twin id must be positive integer");
    }
    const res = await this.client.api.query.tfgridModule.twins(options.id);
    return res.toPrimitive() as unknown as Twin;
  }

  /**
   * Retrieves the `twin ID` associated with the provided account ID.
   *
   * @param options - The options for retrieving the `twin ID`, including the account ID.
   * @returns {Promise<number>} A Promise that resolves to the `twin ID`.
   */
  @checkConnection
  async getTwinIdByAccountId(options: QueryTwinsGetTwinByAccountIdOptions): Promise<number> {
    const res = await this.client.api.query.tfgridModule.twinIdByAccountID(options.accountId);
    return res.toPrimitive() as number;
  }
}

export interface TwinOptions {
  relay: string;
  pk: string;
}

class Twins extends QueryTwins {
  /**
   * Represents a class for interacting with `twin-related` functionalities.
   *
   * @extends `QueryTwins` class.
   *
   * @param {Client} client - The client instance used for interacting with the blockchain.
   */
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  /**
   * Creates a new twin extrinsic with the provided options.
   *
   * @param {TwinOptions} options - The options for creating the twin, including the relay and public key.
   * @returns {Promise<ExtrinsicResult<Twin>>} A Promise that resolves to the created twin extrinsic.
   */
  @checkConnection
  async create(options: TwinOptions): Promise<ExtrinsicResult<Twin>> {
    const extrinsic = await this.client.api.tx.tfgridModule.createTwin(options.relay, options.pk);
    return this.client.patchExtrinsic<Twin>(extrinsic);
  }

  /**
   * Updates an existing twin with the provided options.
   *
   * @param {TwinOptions} options - The options for updating the twin, including the relay and public key.
   * @returns {Promise<ExtrinsicResult<Twin>>} A Promise that resolves to the updated twin extrinsic.
   */
  @checkConnection
  async update(options: TwinOptions): Promise<ExtrinsicResult<Twin>> {
    const extrinsic = await this.client.api.tx.tfgridModule.updateTwin(options.relay, options.pk);
    return this.client.patchExtrinsic<Twin>(extrinsic);
  }

  /**
   * Retrieves the `twin ID` associated with the client's `account ID`.
   *
   * @returns {Promise<number>} A Promise that resolves to the `twin ID` associated with the client's `account ID`.
   */
  @checkConnection
  async getMyTwinId(): Promise<number> {
    return this.getTwinIdByAccountId({ accountId: this.client.address });
  }
}

export { Twins, QueryTwins, Twin };
