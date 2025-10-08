export interface BatchProcessResult<R> {
  results: R[];
  errors: Array<{ batchIndex: number; error: Error }>;
  hasErrors: boolean;
}

export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<R[]>,
): Promise<BatchProcessResult<R>> {
  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const batchResults = await Promise.allSettled(batches.map(batch => processFn(batch)));

  const results: R[] = [];
  const errors: Array<{ batchIndex: number; error: Error }> = [];

  batchResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const batchResult = result.value;
      if (Array.isArray(batchResult)) {
        results.push(...batchResult);
      } else {
        console.error(`Batch ${index} returned non-array result:`, batchResult);
      }
    } else {
      errors.push({
        batchIndex: index,
        error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
      });
    }
  });

  if (errors.length > 0) {
    console.error(`Batch processing completed with ${errors.length} failed batches:`, errors);
  }

  return {
    results,
    errors,
    hasErrors: errors.length > 0,
  };
}
