import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { waitReady } from "@polkadot/wasm-crypto";
import urlJoin from "url-join";

import { bytesFromHex, KeypairType, send, stringToHex } from "../..";
import { KycHeaders, TokenResponse, VerificationDataResponse, VerificationStatusResponse } from "./types";

/**
 * The KYC class provides methods to interact with a TFGid KYC (Know Your Customer) service.
 * It allows fetching verification data, status, and token by preparing necessary headers
 * and sending requests to the specified API domain.
 *
 * @class KYC
 * @example
 * ```typescript
 * const kyc = new KYC("https://api.example.com", "TFChain-address", KeypairType.sr25519, "mnemonic");
 * const data = await kyc.data();
 * const status = await kyc.status();
 * const token = await kyc.token();
 * ```
 * @param {string} apiDomain - The API domain for the KYC service.
 * @param {string} address - The TFChain address.
 * @param {KeypairType} [keypairType=KeypairType.sr25519] - The type of keypair to use.
 * @param {string} mnemonic - The mnemonic for generating the keypair.
 * @method data - Fetches the verification data from the KYC service.
 * @method status - Fetches the verification status from the KYC service.
 * @method token - Fetches the token from the KYC service.
 */
export default class KYC {
  private keyr: Keyring;
  /**
   * Creates an instance of KYC.
   * @param apiDomain - The API domain for the TFGrid KYC service.
   * @param address - The TFChain user address.
   * @param keypairType - The type of keypair to use (default is sr25519).
   * @param mnemonic - The mnemonic for generating the keypair.
   */
  constructor(
    public apiDomain: string,
    public address: string,
    public keypairType: KeypairType = KeypairType.sr25519,
    private mnemonic: string,
  ) {
    this.keyr = new Keyring({ type: keypairType });
  }

  /**
   * Retrieves a key pair from the mnemonic.
   *
   * @returns {Promise<KeyringPair>} A promise that resolves to a KeyringPair object.
   * @private
   */
  private async getKey(): Promise<KeyringPair> {
    await waitReady();
    return this.keyr.addFromUri(this.mnemonic);
  }

  /**
   * Prepares the headers required for TFGrid KYC requests.
   *
   * This method generates a set of headers that include a timestamp-based challenge,
   * a signed challenge using the user's key, and other necessary information.
   *
   * @returns {Promise<Record<string, string>>} A promise that resolves to an object containing the prepared headers.
   *
   */
  private async prepareHeaders(): Promise<Record<string, string>> {
    const timestamp = Date.now();
    const challenge = stringToHex(`${this.apiDomain}:${timestamp}`);
    const key = await this.getKey();
    const signedChallenge = key.sign(bytesFromHex(challenge));
    const signedMsgHex = Buffer.from(signedChallenge).toString("hex");

    const headers: KycHeaders = {
      "content-type": "application/json",
      "X-Client-ID": this.address,
      "X-Challenge": challenge,
      "X-Signature": signedMsgHex,
    };
    return headers as unknown as Record<string, string>;
  }

  /**
   * Fetches the verification data from the API.
   *
   * @returns {Promise<VerificationDataResponse>} A promise that resolves to the verification data response.
   * @throws {RequestError} If there is an issue with fetching the data.
   */
  async data(): Promise<VerificationDataResponse> {
    const headers = await this.prepareHeaders();
    return (await send("GET", urlJoin(this.apiDomain, "data"), "", headers)) as VerificationDataResponse;
  }

  /**
   * Retrieves the current verification status.
   *
   * @returns {Promise<VerificationStatusResponse>} A promise that resolves to the verification status response.
   * @throws {RequestError} If there is an issue with fetching the status data.
   */
  async status(): Promise<VerificationStatusResponse> {
    const headers = await this.prepareHeaders();
    return (await send("GET", urlJoin(this.apiDomain, "status"), "", headers)) as VerificationStatusResponse;
  }

  /**
   * Retrieves a token data from the KYC service API.
   *
   * @returns {Promise<TokenResponse>} A promise that resolves to a TokenResponse object.
   * @throws {RequestError} If there is an issue with fetching the token data.
   */
  async token(): Promise<TokenResponse> {
    const headers = await this.prepareHeaders();
    return (await send("POST", urlJoin(this.apiDomain, "token"), "", headers)) as TokenResponse;
  }
}
