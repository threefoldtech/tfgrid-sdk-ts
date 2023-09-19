import { ID, Int, PartialBoolean } from "../types";
import { assertHasField, assertID } from "../utils";
import { CONNECTION_ENTITY_QUERIES } from "./connection_queries";

export type Variables = { [key: string]: any };

export interface RequestOptions {
  name: string;
  query: string;
  parameters: string[];
  variables: Variables;
}

export abstract class AbstractClient {
  protected abstract _request<T>(options: RequestOptions): Promise<T>;

  protected _list<T>(options: __InternalOptions<ByArray<any, any>, T>): RequestOptions {
    assertHasField(options.fields);

    const { name, entity, limit, offset, orderBy, where, fields } = options;
    const query = `
      ${name}(
        limit: $limit${name},
        offset: $offset${name},
        orderBy: $orderBy${name},
        where: $where${name},
      ) {
        ${AbstractClient.normalizeFields(fields)}
      }
    `;

    return {
      name,
      parameters: [
        `$limit${name}: Int`,
        `$offset${name}: Int`,
        `$orderBy${name}: [${entity}OrderByInput!]`,
        `$where${name}: ${entity}WhereInput`,
      ],
      query,
      variables: {
        [`limit${name}`]: limit,
        [`offset${name}`]: offset,
        [`orderBy${name}`]: orderBy,
        [`where${name}`]: where,
      },
    };
  }

  protected _byId<T>(id: ID, fields: PartialBoolean<T>, name: string): RequestOptions {
    assertID(id);
    assertHasField(fields);

    const query = `
      ${name}(id: $id${name}) {
        ${AbstractClient.normalizeFields(fields)}
      }
    `;

    return {
      name,
      parameters: [`$id${name}: ID!`],
      query,
      variables: { [`id${name}`]: id },
    };
    // return this._request<T>(query, { [`id${name}`]: id }, name);
  }

  protected _connection<T>(fields: PartialBoolean<T>, options: any, name: string): RequestOptions {
    assertHasField(fields);

    const entity = CONNECTION_ENTITY_QUERIES[name];
    const parameters = [
      `$after${name}: String`,
      `$first${name}: Int`,
      `$orderBy${name}: [${entity}OrderByInput!]!`,
      `$where${name}: ${entity}WhereInput`,
    ];
    const query = `
      ${name}(
        after: $after${name},
        first: $first${name},
        orderBy: $orderBy${name},
        where: $where${name}
      ) {
        ${AbstractClient.normalizeFields(fields)}
      }
    `;

    return {
      name,
      query,
      parameters,
      variables: {
        [`after${name}`]: options.after,
        [`first${name}`]: options.first,
        [`orderBy${name}`]: options.orderBy,
        [`where${name}`]: options.where,
      },
    };
  }

  private static normalizeFields<T>(fields: PartialBoolean<T>): string {
    return Object.entries(fields)
      .reduce((out, [key, value]: any) => {
        out.push(value === true ? key : `${key}{${AbstractClient.normalizeFields(value)}}`);
        return out;
      }, <string[]>[])
      .join(",");
  }
}

type __InternalOptions<T, R> = T & {
  name: string;
  entity: string;
  fields: PartialBoolean<R>;
};

export type ByIdOptions = { id: ID };
export type ByArray<OrderBy extends string = "", Where extends object = {}> = {
  limit?: Int;
  offset?: Int;
  orderBy?: `${OrderBy}_${"ASC" | "DESC"}`[];
  where?: Where;
};
export type ByConnection<OrderBy extends string = "", Where extends object = {}> = {
  after?: string;
  first?: Int;
  orderBy: OrderBy[];
  where?: Where;
};
