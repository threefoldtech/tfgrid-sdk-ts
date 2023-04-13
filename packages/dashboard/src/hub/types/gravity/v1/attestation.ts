/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Any } from "../../google/protobuf/any";

export const protobufPackage = "gravity.v1";

export enum ClaimType {
  CLAIM_TYPE_UNSPECIFIED = 0,
  CLAIM_TYPE_SEND_TO_COSMOS = 1,
  CLAIM_TYPE_BATCH_SEND_TO_ETH = 2,
  CLAIM_TYPE_ERC20_DEPLOYED = 3,
  CLAIM_TYPE_LOGIC_CALL_EXECUTED = 4,
  CLAIM_TYPE_VALSET_UPDATED = 5,
  UNRECOGNIZED = -1,
}

export function claimTypeFromJSON(object: any): ClaimType {
  switch (object) {
    case 0:
    case "CLAIM_TYPE_UNSPECIFIED":
      return ClaimType.CLAIM_TYPE_UNSPECIFIED;
    case 1:
    case "CLAIM_TYPE_SEND_TO_COSMOS":
      return ClaimType.CLAIM_TYPE_SEND_TO_COSMOS;
    case 2:
    case "CLAIM_TYPE_BATCH_SEND_TO_ETH":
      return ClaimType.CLAIM_TYPE_BATCH_SEND_TO_ETH;
    case 3:
    case "CLAIM_TYPE_ERC20_DEPLOYED":
      return ClaimType.CLAIM_TYPE_ERC20_DEPLOYED;
    case 4:
    case "CLAIM_TYPE_LOGIC_CALL_EXECUTED":
      return ClaimType.CLAIM_TYPE_LOGIC_CALL_EXECUTED;
    case 5:
    case "CLAIM_TYPE_VALSET_UPDATED":
      return ClaimType.CLAIM_TYPE_VALSET_UPDATED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ClaimType.UNRECOGNIZED;
  }
}

export function claimTypeToJSON(object: ClaimType): string {
  switch (object) {
    case ClaimType.CLAIM_TYPE_UNSPECIFIED:
      return "CLAIM_TYPE_UNSPECIFIED";
    case ClaimType.CLAIM_TYPE_SEND_TO_COSMOS:
      return "CLAIM_TYPE_SEND_TO_COSMOS";
    case ClaimType.CLAIM_TYPE_BATCH_SEND_TO_ETH:
      return "CLAIM_TYPE_BATCH_SEND_TO_ETH";
    case ClaimType.CLAIM_TYPE_ERC20_DEPLOYED:
      return "CLAIM_TYPE_ERC20_DEPLOYED";
    case ClaimType.CLAIM_TYPE_LOGIC_CALL_EXECUTED:
      return "CLAIM_TYPE_LOGIC_CALL_EXECUTED";
    case ClaimType.CLAIM_TYPE_VALSET_UPDATED:
      return "CLAIM_TYPE_VALSET_UPDATED";
    default:
      return "UNKNOWN";
  }
}

/**
 * Attestation is an aggregate of `claims` that eventually becomes `observed` by
 * all orchestrators
 * EVENT_NONCE:
 * EventNonce a nonce provided by the gravity contract that is unique per event fired
 * These event nonces must be relayed in order. This is a correctness issue,
 * if relaying out of order transaction replay attacks become possible
 * OBSERVED:
 * Observed indicates that >67% of validators have attested to the event,
 * and that the event should be executed by the gravity state machine
 *
 * The actual content of the claims is passed in with the transaction making the claim
 * and then passed through the call stack alongside the attestation while it is processed
 * the key in which the attestation is stored is keyed on the exact details of the claim
 * but there is no reason to store those exact details becuause the next message sender
 * will kindly provide you with them.
 */
export interface Attestation {
  observed: boolean;
  votes: string[];
  height: Long;
  claim?: Any;
}

/**
 * ERC20Token unique identifier for an Ethereum ERC20 token.
 * CONTRACT:
 * The contract address on ETH of the token, this could be a Cosmos
 * originated token, if so it will be the ERC20 address of the representation
 * (note: developers should look up the token symbol using the address on ETH to display for UI)
 */
export interface ERC20Token {
  contract: string;
  amount: string;
}

function createBaseAttestation(): Attestation {
  return { observed: false, votes: [], height: Long.UZERO, claim: undefined };
}

export const Attestation = {
  encode(message: Attestation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.observed === true) {
      writer.uint32(8).bool(message.observed);
    }
    for (const v of message.votes) {
      writer.uint32(18).string(v!);
    }
    if (!message.height.isZero()) {
      writer.uint32(24).uint64(message.height);
    }
    if (message.claim !== undefined) {
      Any.encode(message.claim, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Attestation {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAttestation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.observed = reader.bool();
          break;
        case 2:
          message.votes.push(reader.string());
          break;
        case 3:
          message.height = reader.uint64() as Long;
          break;
        case 4:
          message.claim = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Attestation {
    return {
      observed: isSet(object.observed) ? Boolean(object.observed) : false,
      votes: Array.isArray(object?.votes) ? object.votes.map((e: any) => String(e)) : [],
      height: isSet(object.height) ? Long.fromString(object.height) : Long.UZERO,
      claim: isSet(object.claim) ? Any.fromJSON(object.claim) : undefined,
    };
  },

  toJSON(message: Attestation): unknown {
    const obj: any = {};
    message.observed !== undefined && (obj.observed = message.observed);
    if (message.votes) {
      obj.votes = message.votes.map(e => e);
    } else {
      obj.votes = [];
    }
    message.height !== undefined && (obj.height = (message.height || Long.UZERO).toString());
    message.claim !== undefined && (obj.claim = message.claim ? Any.toJSON(message.claim) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Attestation>, I>>(object: I): Attestation {
    const message = createBaseAttestation();
    message.observed = object.observed ?? false;
    message.votes = object.votes?.map(e => e) || [];
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.UZERO;
    message.claim = object.claim !== undefined && object.claim !== null ? Any.fromPartial(object.claim) : undefined;
    return message;
  },
};

function createBaseERC20Token(): ERC20Token {
  return { contract: "", amount: "" };
}

export const ERC20Token = {
  encode(message: ERC20Token, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.contract !== "") {
      writer.uint32(10).string(message.contract);
    }
    if (message.amount !== "") {
      writer.uint32(18).string(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ERC20Token {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseERC20Token();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contract = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ERC20Token {
    return {
      contract: isSet(object.contract) ? String(object.contract) : "",
      amount: isSet(object.amount) ? String(object.amount) : "",
    };
  },

  toJSON(message: ERC20Token): unknown {
    const obj: any = {};
    message.contract !== undefined && (obj.contract = message.contract);
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ERC20Token>, I>>(object: I): ERC20Token {
    const message = createBaseERC20Token();
    message.contract = object.contract ?? "";
    message.amount = object.amount ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
