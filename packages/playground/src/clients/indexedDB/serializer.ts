export type SerializeTypes = "Array" | "Function" | "Object" | "Set" | "Map" | "Literal";

export class IndexedDBSerializer {
  constructor() {
    this.serialize = this.serialize.bind(this);
  }

  public serialize(value: any): any {
    if (value === null) {
      value = "OfType(`Null`)";
    }

    if (value === undefined) {
      value = "OfType(`undefined`)";
    }

    if (Array.isArray(value)) {
      return this._of("Array", value.map(this.serialize));
    }

    if (typeof value === "function") {
      return this._of("Function", value.toString());
    }

    if (value instanceof Set) {
      return this._of("Set", Array.from(value).map(this.serialize));
    }

    if (value instanceof Map) {
      return this._of("Map", this._serializeMap(value));
    }

    if (typeof value === "object") {
      return this._of("Object", this._serializeObj(value));
    }

    if (value && typeof value.toString === "string") {
      return this._of("Literal", value.toString());
    }

    return this._of("Literal", String(value));
  }

  public isArray(value: any): value is { value: any[] } {
    return this._isSerialized(value) && value.type === "Array";
  }

  public isFunction(value: any): value is { value: string } {
    return this._isSerialized(value) && value.type === "Function";
  }

  public isObject(value: any): value is { value: [any, any][] } {
    return this._isSerialized(value) && value.type === "Object";
  }

  public isSet(value: any): value is { value: any[] } {
    return this._isSerialized(value) && value.type === "Set";
  }

  public isMap(value: any): value is { value: [any, any][] } {
    return this._isSerialized(value) && value.type === "Map";
  }

  public isLiteral(value: any): value is { value: string } {
    return this._isSerialized(value) && value.type === "Literal";
  }

  public ofType(type: SerializeTypes, value: any) {
    return this._of(type, value);
  }

  private _of(type: SerializeTypes, value: any) {
    return {
      type,
      value,
    };
  }

  private _serializeObj(obj: object): any[] {
    const res = [] as any[];
    for (const [key, value] of Object.entries(obj)) {
      res.push([this.serialize(key), this.serialize(value)]);
    }
    return res;
  }

  private _serializeMap(map: Map<any, any>): any[] {
    const res = [] as any[];
    for (const [k, v] of map) {
      res.push([this.serialize(k), this.serialize(v)]);
    }
    return res;
  }

  private _isSerialized(obj: any): obj is { type: SerializeTypes; value: any } {
    return typeof obj === "object" && typeof obj.type === "string";
  }
}
