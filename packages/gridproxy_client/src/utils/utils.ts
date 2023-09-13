import { Pagination } from "public_api";

export function capitalize(value: string) {
  return value[0].toLocaleUpperCase() + value.slice(1);
}

export function min(value: number, min: number): boolean {
  return value >= min;
}

export async function resolvePaginator<T>(res: Response): Promise<Pagination<T>> {
  const count = res.headers.get("count");
  return {
    count: count ? +count : null,
    data: await res.json(),
  };
}
