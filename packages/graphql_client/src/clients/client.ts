import { AbstractClient, RequestOptions } from "./abstract_client";
import { BY_ID_QUERIES, ByIdQueries } from "./by_id_queries";
import { CONNECTION_QUERIES, ConnectionQueries } from "./connection_queries";
import { LIST_QUERIES, ListQueries } from "./list_queries";

export enum Networks {
  Dev = "dev",
  Test = "test",
  Qa = "qa",
  Main = "main",
}

type _Merge = ListQueries & ByIdQueries & ConnectionQueries;

export type MergableQuery = {
  [K in keyof _Merge]?: Parameters<_Merge[K]>;
};

export class TFGridGqlClient extends AbstractClient {
  private readonly __uri: string;

  constructor(network: Networks) {
    super();

    this.__uri =
      network === Networks.Main ? "https://graphql.grid.tf/graphql" : `https://graphql.${network}.grid.tf/graphql`;
  }

  protected async _request<T>(options: RequestOptions): Promise<T> {
    const { name, parameters, query, variables } = options;
    const p = parameters && parameters.length ? `(${parameters.join(", ")})` : "";
    const res = await fetch(this.__uri, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `
          query TFGridClientQuery${p} {
            ${query}
          }
        `,
        variables,
      }),
    });
    const { data } = await res.json();
    return name ? data[name] : data;
  }

  public merge<T extends MergableQuery>(queries: T) {
    const options: RequestOptions[] = [];
    for (const query in queries) {
      options.push(this[`__${query}` as any].apply(this, queries[query]));
    }

    const mergedOptions = options.reduce(
      (o, { parameters, query, variables }) => {
        o.parameters = [...o.parameters, ...parameters];
        o.query += ` ${query}`;
        o.variables = { ...o.variables, ...variables };
        return o;
      },
      {
        name: null as any,
        parameters: [],
        query: "",
        variables: {},
      } as RequestOptions,
    );

    return this._request<NormalizeMerge<T>>(mergedOptions);
  }
}

type NormalizeMerge<T> = {
  [K in keyof T]: K extends keyof ListQueries
    ? ReturnType<ListQueries[K]> extends Promise<Array<infer Q>>
      ? Q[]
      : unknown
    : K extends keyof ByIdQueries
    ? ReturnType<ByIdQueries[K]> extends Promise<infer Q>
      ? Q
      : unknown
    : K extends keyof ConnectionQueries
    ? ReturnType<ConnectionQueries[K]> extends Promise<infer Q>
      ? Q
      : unknown
    : unknown;
};

export interface TFGridGqlClient extends ListQueries, ByIdQueries, ConnectionQueries {}

for (const [entity, query] of Object.entries(LIST_QUERIES)) {
  Object.defineProperty(TFGridGqlClient.prototype, `__${query}`, {
    value(this: TFGridGqlClient, fields: any, options: any) {
      return this._list({ name: query, entity, fields, ...options });
    },
  });

  Object.defineProperty(TFGridGqlClient.prototype, query, {
    value(this: TFGridGqlClient, fields: any, options: any) {
      return this._request(this[`__${query}`](fields, options));
    },
  });
}

for (const query of Object.values(BY_ID_QUERIES)) {
  Object.defineProperty(TFGridGqlClient.prototype, `__${query}`, {
    value(this: TFGridGqlClient, id: any, fields: any) {
      return this._byId(id, fields, query);
    },
  });

  Object.defineProperty(TFGridGqlClient.prototype, query, {
    value(this: TFGridGqlClient, id: any, fields: any) {
      return this._request(this[`__${query}`](id, fields));
    },
  });
}

for (const query of Object.values(CONNECTION_QUERIES)) {
  Object.defineProperty(TFGridGqlClient.prototype, `__${query}`, {
    value(this: TFGridGqlClient, fields: any, options: any) {
      return this._connection(fields, options, query);
    },
  });

  Object.defineProperty(TFGridGqlClient.prototype, query, {
    value(this: TFGridGqlClient, fields: any, options: any) {
      return this._request(this[`__${query}`](fields, options));
    },
  });
}
