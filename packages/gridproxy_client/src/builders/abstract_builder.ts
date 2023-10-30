import { assertPattern, assertString } from "../utils";

export type BuilderMapper<T> = {
  [K in keyof T]: string;
};

export type BuilderValidator<T> = {
  [K in keyof T]: (value: T[K]) => void | never;
};

export interface BuilderOptions<T> {
  mapper: BuilderMapper<T>;
  validator: BuilderValidator<T>;
  queries: Partial<T>;
}

export interface Pagination<T> {
  count: number | null;
  data: T;
}

export abstract class AbstractBuilder<T> {
  public abstract readonly uri: string;
  private readonly __queries: Partial<T>;
  private readonly __mapper: BuilderMapper<T>;
  private readonly __validator: BuilderValidator<T>;

  public constructor(options: BuilderOptions<T>) {
    this.__mapper = options.mapper;
    this.__validator = options.validator;
    this.__queries = options.queries;

    for (const key of Object.keys(this.__mapper)) {
      Object.defineProperty(this, key, {
        value(value: any) {
          this.__queries[key as any] = value;
          return this;
        },
      });
    }
  }

  public async build(path: string, timeout = 10000): Promise<Response> {
    assertString(path);
    assertPattern(path, /^\//);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const out: string[] = [];

      for (const key in this.__queries) {
        if (this.__queries[key] === undefined || this.__queries[key] === null || this.__queries[key] === "") {
          continue;
        }

        this.__validator[key](this.__queries[key]!);
        out.push(`${this.__mapper[key]}=${this.__queries[key]}`);
      }

      const query = out.length > 0 ? `?${out.join("&")}` : "";
      const response = await fetch(`${this.uri}${path}${query}`, {
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export type BuilderMethods<T, B> = {
  [K in keyof T]: (value: T[K]) => B;
};
