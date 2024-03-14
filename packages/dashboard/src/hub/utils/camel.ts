const toCamel = (s: string) => {
  return s.replace(/([-_][a-z])/gi, ($1: string) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};
export function snakeToCamelCase(obj: any) {
  if (typeof obj != "object" || obj === undefined || obj === null) return;

  if (Array.isArray(obj)) {
    for (const v of obj) {
      snakeToCamelCase(v);
    }
  } else {
    Object.entries(obj).forEach(([k, v]) => {
      const camelK = toCamel(k);
      if (camelK != k) {
        obj[camelK] = obj[k];
        delete obj[k];
      }
      snakeToCamelCase(v);
    });
  }
}
