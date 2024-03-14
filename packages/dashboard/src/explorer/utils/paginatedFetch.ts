export default async function paginated_fetcher(
  url: string,
  page: number,
  pageSize: number,
  previousResponse = [],
): Promise<any> {
  const response = await fetch(`${url}?page=${page}&size=${pageSize}`);
  const data = await response.json();
  if (data.length === 0) {
    return previousResponse;
  }
  return paginated_fetcher(url, page + 1, pageSize, previousResponse.concat(data));
}
