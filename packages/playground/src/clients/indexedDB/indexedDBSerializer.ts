export type SerializeTypes = "Array" | "Function" | "Object" | "Set" | "Map" | "Literal";

export class IndexedDBSerializer {
  constructor() {
    this.serialize = this.serialize.bind(this);
    this.toString = this.toString.bind(this);
  }

  public serialize(value: any): string {
    if (value === null) {
      return "OfType(`Null`)";
    }

    if (value === undefined) {
      return "OfType(`undefined`)";
    }

    if (Array.isArray(value)) {
      return `Array(${value.length}) [${value.map(this.serialize).join(", ")}]`;
    }

    if (typeof value === "function") {
      return `Function '${value.toString()}'`;
    }

    if (value instanceof Set) {
      return `Set(${value.size}) {${Array.from(value).map(this.serialize).join(", ")}}`;
    }

    if (value instanceof Map) {
      return `Map(${value.size}) {${Array.from(value)
        .map(([k, v]) => `${this.serialize(k)} => ${this.serialize(v)}`)
        .join(", ")}}`;
    }

    if (typeof value === "object") {
      return `Object(${Object.keys(value).length}) {${Object.entries(value)
        .map(([k, v]) => `"${this.serialize(k)}": ${this.serialize(v)}`)
        .join(", ")}}`;
    }

    if (value && typeof value.toString === "string") {
      return value.toString();
    }

    return String(value);
  }
}
