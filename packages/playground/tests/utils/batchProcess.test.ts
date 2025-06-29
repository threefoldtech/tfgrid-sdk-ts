import { beforeEach, describe, expect, it, vi } from "vitest";

import { batchProcess, BatchProcessOptions } from "../../src/utils/batch_process";

describe("batchProcess", () => {
  const mockProcessFn = vi.fn();

  beforeEach(() => {
    mockProcessFn.mockClear();
    vi.clearAllMocks();
  });

  describe("successful processing", () => {
    it("should process items in batches and return all results", async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const batchSize = 3;

      mockProcessFn
        .mockResolvedValueOnce(["a", "b", "c"])
        .mockResolvedValueOnce(["d", "e", "f"])
        .mockResolvedValueOnce(["g", "h", "i"])
        .mockResolvedValueOnce(["j"]);

      const result = await batchProcess(items, batchSize, mockProcessFn);

      expect(result.results).toEqual(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]);
      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
      expect(mockProcessFn).toHaveBeenCalledTimes(4);
      expect(mockProcessFn).toHaveBeenNthCalledWith(1, [1, 2, 3]);
      expect(mockProcessFn).toHaveBeenNthCalledWith(2, [4, 5, 6]);
      expect(mockProcessFn).toHaveBeenNthCalledWith(3, [7, 8, 9]);
      expect(mockProcessFn).toHaveBeenNthCalledWith(4, [10]);
    });

    it("should handle empty input array", async () => {
      const result = await batchProcess([], 5, mockProcessFn);

      expect(result.results).toEqual([]);
      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
      expect(mockProcessFn).not.toHaveBeenCalled();
    });

    it("should handle single batch", async () => {
      const items = [1, 2, 3];
      mockProcessFn.mockResolvedValueOnce(["a", "b", "c"]);

      const result = await batchProcess(items, 5, mockProcessFn);

      expect(result.results).toEqual(["a", "b", "c"]);
      expect(result.hasErrors).toBe(false);
      expect(mockProcessFn).toHaveBeenCalledTimes(1);
      expect(mockProcessFn).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  describe("error handling - resilient mode (default)", () => {
    it("should continue processing when some batches fail", async () => {
      const items = [1, 2, 3, 4, 5, 6];
      const batchSize = 2;
      const error1 = new Error("Batch 1 failed");
      const error2 = new Error("Batch 2 failed");

      mockProcessFn.mockRejectedValueOnce(error1).mockResolvedValueOnce(["c", "d"]).mockRejectedValueOnce(error2);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await batchProcess(items, batchSize, mockProcessFn);

      expect(result.results).toEqual(["c", "d"]);
      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toEqual({ batchIndex: 0, error: error1 });
      expect(result.errors[1]).toEqual({ batchIndex: 2, error: error2 });
      expect(consoleSpy).toHaveBeenCalledWith("Batch processing completed with 2 failed batches:", result.errors);

      consoleSpy.mockRestore();
    });

    it("should normalize non-Error rejections", async () => {
      const items = [1, 2];
      mockProcessFn.mockRejectedValueOnce("String error");

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await batchProcess(items, 1, mockProcessFn);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBeInstanceOf(Error);
      expect(result.errors[0].error.message).toBe("String error");

      consoleSpy.mockRestore();
    });
  });

  describe("error handling - fail fast mode", () => {
    it("should throw on first error when failFast is true", async () => {
      const items = [1, 2, 3, 4];
      const batchSize = 2;
      const error = new Error("First batch failed");

      mockProcessFn.mockRejectedValueOnce(error).mockResolvedValueOnce(["c", "d"]);

      const options: BatchProcessOptions = { failFast: true };

      await expect(batchProcess(items, batchSize, mockProcessFn, options)).rejects.toThrow(error);

      expect(mockProcessFn).toHaveBeenCalledTimes(2);
    });

    it("should return successful results when no errors in fail fast mode", async () => {
      const items = [1, 2, 3, 4];
      const batchSize = 2;

      mockProcessFn.mockResolvedValueOnce(["a", "b"]).mockResolvedValueOnce(["c", "d"]);

      const options: BatchProcessOptions = { failFast: true };
      const result = await batchProcess(items, batchSize, mockProcessFn, options);

      expect(result.results).toEqual(["a", "b", "c", "d"]);
      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("should handle batch size larger than items length", async () => {
      const items = [1, 2, 3];
      mockProcessFn.mockResolvedValueOnce(["a", "b", "c"]);

      const result = await batchProcess(items, 10, mockProcessFn);

      expect(result.results).toEqual(["a", "b", "c"]);
      expect(mockProcessFn).toHaveBeenCalledTimes(1);
      expect(mockProcessFn).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("should handle batch size of 1", async () => {
      const items = [1, 2, 3];
      mockProcessFn.mockResolvedValueOnce(["a"]).mockResolvedValueOnce(["b"]).mockResolvedValueOnce(["c"]);

      const result = await batchProcess(items, 1, mockProcessFn);

      expect(result.results).toEqual(["a", "b", "c"]);
      expect(mockProcessFn).toHaveBeenCalledTimes(3);
    });

    it("should handle processFn returning empty arrays", async () => {
      const items = [1, 2, 3, 4];
      mockProcessFn.mockResolvedValueOnce([]).mockResolvedValueOnce(["a", "b"]);

      const result = await batchProcess(items, 2, mockProcessFn);

      expect(result.results).toEqual(["a", "b"]);
      expect(result.hasErrors).toBe(false);
    });

    it("should handle processFn returning non-array values", async () => {
      const items = [1, 2, 3, 4];
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockProcessFn.mockResolvedValueOnce("not an array" as any).mockResolvedValueOnce(["a", "b"]);

      const result = await batchProcess(items, 2, mockProcessFn);

      expect(result.results).toEqual(["a", "b"]);
      expect(result.hasErrors).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("Batch 0 returned non-array result:", "not an array");

      consoleSpy.mockRestore();
    });
  });

  describe("parallel processing", () => {
    it("should process batches in parallel", async () => {
      const items = [1, 2, 3, 4];
      const batchSize = 2;
      const callOrder: number[] = [];

      mockProcessFn.mockImplementation(async (batch: number[]) => {
        callOrder.push(batch[0]);
        await new Promise(resolve => setTimeout(resolve, 50));
        return [`result-${batch[0]}`];
      });

      await batchProcess(items, batchSize, mockProcessFn);

      expect(mockProcessFn).toHaveBeenCalledTimes(2);
      expect(callOrder).toEqual([1, 3]);
    });
  });
});
