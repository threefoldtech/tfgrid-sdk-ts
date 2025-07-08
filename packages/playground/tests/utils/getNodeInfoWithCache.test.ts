import { NodeStatus } from "@threefold/gridproxy_client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the getNodeInfo function before importing the module under test
vi.mock("../../src/utils/contracts", () => ({
  getNodeInfo: vi.fn(),
}));

// Import after mocking
import { getNodeInfo } from "../../src/utils/contracts";
import { clearNodeInfoCache, getNodeInfoWithCache } from "../../src/utils/get_nodes";

describe("getNodeInfoWithCache", () => {
  const mockGetNodeInfo = vi.mocked(getNodeInfo);

  beforeEach(() => {
    mockGetNodeInfo.mockClear();
    vi.clearAllMocks();
    clearNodeInfoCache(); // Clear the cache between tests for isolation
  });

  describe("caching behavior", () => {
    it("should fetch node info and cache results on first call", async () => {
      const nodeIds = [1, 2, 3];
      const mockResponse = {
        "1": { status: NodeStatus.Up, farmId: 100 },
        "2": { status: NodeStatus.Up, farmId: 101 },
        "3": { status: NodeStatus.Down, farmId: 102 },
      };

      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      const result = await getNodeInfoWithCache(nodeIds);

      expect(mockGetNodeInfo).toHaveBeenCalledTimes(1);
      expect(mockGetNodeInfo).toHaveBeenCalledWith([1, 2, 3], []);
      expect(result).toEqual([
        { status: NodeStatus.Up, farmId: 100 },
        { status: NodeStatus.Up, farmId: 101 },
        { status: NodeStatus.Down, farmId: 102 },
      ]);
    });

    it("should return cached results without API call on subsequent calls", async () => {
      const nodeIds = [1, 2];
      const mockResponse = {
        "1": { status: NodeStatus.Up, farmId: 100 },
        "2": { status: NodeStatus.Up, farmId: 101 },
      };

      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      // First call - should fetch from API
      const firstResult = await getNodeInfoWithCache(nodeIds);

      // Second call - should use cache
      const secondResult = await getNodeInfoWithCache(nodeIds);

      expect(mockGetNodeInfo).toHaveBeenCalledTimes(1);
      expect(firstResult).toEqual(secondResult);
      expect(secondResult).toEqual([
        { status: NodeStatus.Up, farmId: 100 },
        { status: NodeStatus.Up, farmId: 101 },
      ]);
    });

    it("should only fetch uncached nodes when mixing cached and uncached requests", async () => {
      const initialNodeIds = [1, 2];
      const initialMockResponse = {
        "1": { status: NodeStatus.Up, farmId: 100 },
        "2": { status: NodeStatus.Up, farmId: 101 },
      };

      const additionalMockResponse = {
        "3": { status: NodeStatus.Down, farmId: 102 },
        "4": { status: NodeStatus.Standby, farmId: 103 },
      };

      mockGetNodeInfo.mockResolvedValueOnce(initialMockResponse).mockResolvedValueOnce(additionalMockResponse);

      // First call - cache nodes 1 and 2
      await getNodeInfoWithCache(initialNodeIds);

      // Second call - mix of cached (1, 2) and uncached (3, 4) nodes
      const mixedNodeIds = [1, 3, 2, 4];
      const result = await getNodeInfoWithCache(mixedNodeIds);

      expect(mockGetNodeInfo).toHaveBeenCalledTimes(2);
      expect(mockGetNodeInfo).toHaveBeenNthCalledWith(1, [1, 2], []);
      expect(mockGetNodeInfo).toHaveBeenNthCalledWith(2, [3, 4], []);

      expect(result).toEqual([
        { status: NodeStatus.Up, farmId: 100 },
        { status: NodeStatus.Down, farmId: 102 },
        { status: NodeStatus.Up, farmId: 101 },
        { status: NodeStatus.Standby, farmId: 103 },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty node IDs array", async () => {
      const result = await getNodeInfoWithCache([]);

      expect(mockGetNodeInfo).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle single node ID", async () => {
      const nodeIds = [42];
      const mockResponse = {
        "42": { status: NodeStatus.Up, farmId: 200 },
      };

      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      const result = await getNodeInfoWithCache(nodeIds);

      expect(mockGetNodeInfo).toHaveBeenCalledTimes(1);
      expect(mockGetNodeInfo).toHaveBeenCalledWith([42], []);
      expect(result).toEqual([{ status: NodeStatus.Up, farmId: 200 }]);
    });

    it("should handle duplicate node IDs in request", async () => {
      const nodeIds = [1, 2, 1, 3, 2];
      const mockResponse = {
        "1": { status: NodeStatus.Up, farmId: 100 },
        "2": { status: NodeStatus.Up, farmId: 101 },
        "3": { status: NodeStatus.Down, farmId: 102 },
      };

      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      const result = await getNodeInfoWithCache(nodeIds);

      expect(mockGetNodeInfo).toHaveBeenCalledTimes(1);
      expect(mockGetNodeInfo).toHaveBeenCalledWith([1, 2, 3], []);
      expect(result).toEqual([
        { status: NodeStatus.Up, farmId: 100 },
        { status: NodeStatus.Up, farmId: 101 },
        { status: NodeStatus.Up, farmId: 100 },
        { status: NodeStatus.Down, farmId: 102 },
        { status: NodeStatus.Up, farmId: 101 },
      ]);
    });

    it("should handle API returning partial results", async () => {
      const nodeIds = [1, 2, 3];
      const mockResponse = {
        "1": { status: NodeStatus.Up, farmId: 100 },
        // Missing node 2 and 3 from response
      };

      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      const result = await getNodeInfoWithCache(nodeIds);

      expect(result).toEqual([
        { status: NodeStatus.Up, farmId: 100 },
        undefined, // node 2 not found in response
        undefined, // node 3 not found in response
      ]);
    });
  });

  describe("error handling", () => {
    it("should propagate API errors", async () => {
      const nodeIds = [1, 2];
      const apiError = new Error("API request failed");

      mockGetNodeInfo.mockRejectedValueOnce(apiError);

      await expect(getNodeInfoWithCache(nodeIds)).rejects.toThrow("API request failed");
      expect(mockGetNodeInfo).toHaveBeenCalledTimes(1);
    });

    it("should handle cached data correctly even after previous API error", async () => {
      const nodeIds = [1, 2];
      const apiError = new Error("API request failed");

      mockGetNodeInfo.mockRejectedValueOnce(apiError);

      // First call fails
      await expect(getNodeInfoWithCache(nodeIds)).rejects.toThrow("API request failed");

      // Second call should still try to fetch (cache should be empty)
      const mockResponse = {
        "1": { status: NodeStatus.Up, farmId: 100 },
        "2": { status: NodeStatus.Up, farmId: 101 },
      };
      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      const result = await getNodeInfoWithCache(nodeIds);

      expect(mockGetNodeInfo).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { status: NodeStatus.Up, farmId: 100 },
        { status: NodeStatus.Up, farmId: 101 },
      ]);
    });
  });

  describe("performance characteristics", () => {
    it("should minimize API calls with large datasets", async () => {
      const largeNodeIdSet = Array.from({ length: 100 }, (_, i) => i + 1);
      const mockResponse = Object.fromEntries(
        largeNodeIdSet.map(id => [id.toString(), { status: NodeStatus.Up, farmId: 100 + id }]),
      );

      mockGetNodeInfo.mockResolvedValueOnce(mockResponse);

      // First call - fetch all
      await getNodeInfoWithCache(largeNodeIdSet);

      // Multiple subsequent calls with overlapping subsets
      await getNodeInfoWithCache([1, 2, 3, 4, 5]);
      await getNodeInfoWithCache([10, 20, 30, 40, 50]);
      await getNodeInfoWithCache([95, 96, 97, 98, 99, 100]);

      // Should only have made one API call
      expect(mockGetNodeInfo).toHaveBeenCalledTimes(1);
    });
  });
});
