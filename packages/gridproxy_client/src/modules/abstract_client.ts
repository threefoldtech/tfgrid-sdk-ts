export interface AbstractClientOptions {
  uri: string;
  Builder: any;
}

export abstract class AbstractClient<B, Q> {
  public readonly uri: string;
  private readonly __Builder: any;

  constructor(options: AbstractClientOptions) {
    this.uri = options.uri;
    this.__Builder = options.Builder;
  }

  public builder(queries: Partial<Q> = {}): B {
    for (const key of Object.keys(queries)) {
      if (!queries[key]) {
        delete queries[key];
      }
    }

    return new this.__Builder(this.uri, queries);
  }
}
