/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "gravity.v1";

/** IDSet represents a set of IDs */
export interface IDSet {
  ids: Long[];
}

export interface BatchFees {
  token: string;
  totalFees: string;
  txCount: Long;
}

function createBaseIDSet(): IDSet {
  return { ids: [] };
}

export const IDSet = {
  encode(message: IDSet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IDSet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIDSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint64() as Long);
            }
          } else {
            message.ids.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IDSet {
    return {
      ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Long.fromString(e)) : [],
    };
  },

  toJSON(message: IDSet): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map(e => (e || Long.UZERO).toString());
    } else {
      obj.ids = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IDSet>, I>>(object: I): IDSet {
    const message = createBaseIDSet();
    message.ids = object.ids?.map(e => Long.fromValue(e)) || [];
    return message;
  },
};

function createBaseBatchFees(): BatchFees {
  return { token: "", totalFees: "", txCount: Long.UZERO };
}

export const BatchFees = {
  encode(message: BatchFees, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.totalFees !== "") {
      writer.uint32(18).string(message.totalFees);
    }
    if (!message.txCount.isZero()) {
      writer.uint32(24).uint64(message.txCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchFees {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchFees();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        case 2:
          message.totalFees = reader.string();
          break;
        case 3:
          message.txCount = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BatchFees {
    return {
      token: isSet(object.token) ? String(object.token) : "",
      totalFees: isSet(object.totalFees) ? String(object.totalFees) : "",
      txCount: isSet(object.txCount) ? Long.fromString(object.txCount) : Long.UZERO,
    };
  },

  toJSON(message: BatchFees): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    message.totalFees !== undefined && (obj.totalFees = message.totalFees);
    message.txCount !== undefined && (obj.txCount = (message.txCount || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<BatchFees>, I>>(object: I): BatchFees {
    const message = createBaseBatchFees();
    message.token = object.token ?? "";
    message.totalFees = object.totalFees ?? "";
    message.txCount =
      object.txCount !== undefined && object.txCount !== null ? Long.fromValue(object.txCount) : Long.UZERO;
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
