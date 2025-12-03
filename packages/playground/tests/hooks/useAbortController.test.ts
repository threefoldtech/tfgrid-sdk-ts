import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, onMounted } from "vue";

import { useAbortController, useFetch, useWithAbortSignal } from "../../src/hooks/useAbortController";

// Clean up any pending timers after each test
afterEach(() => {
  vi.clearAllTimers();
});

describe("useAbortController", () => {
  it("should create an AbortSignal", () => {
    const TestComponent = defineComponent({
      setup() {
        const signal = useAbortController();
        expect(signal).toBeInstanceOf(AbortSignal);
        expect(signal.aborted).toBe(false);
        return {};
      },
      template: "<div>Test</div>",
    });

    mount(TestComponent);
  });

  it("should abort signal when component unmounts", async () => {
    let signal: AbortSignal | null = null;

    const TestComponent = defineComponent({
      setup() {
        signal = useAbortController();
        expect(signal.aborted).toBe(false);
        return {};
      },
      template: "<div>Test</div>",
    });

    const wrapper = mount(TestComponent);
    expect(signal?.aborted).toBe(false);

    wrapper.unmount();
    // Wait for Vue to process the unmount
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(signal?.aborted).toBe(true);
  });

  it("should abort fetch request when component unmounts", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: "test" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const TestComponent = defineComponent({
      setup() {
        const fetchWithSignal = useFetch();
        onMounted(async () => {
          await fetchWithSignal("https://example.com/api");
        });
        return {};
      },
      template: "<div>Test</div>",
    });

    const wrapper = mount(TestComponent);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify fetch was called with signal
    expect(fetchSpy).toHaveBeenCalled();
    const fetchCall = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(fetchCall?.signal).toBeInstanceOf(AbortSignal);
    expect(fetchCall?.signal?.aborted).toBe(false);

    // Unmount component
    wrapper.unmount();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Signal should be aborted
    expect(fetchCall?.signal?.aborted).toBe(true);

    fetchSpy.mockRestore();
  });

  it("should wrap function with abort signal", async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: "test" });
    let wrappedFn: ReturnType<typeof useWithAbortSignal<typeof mockFn>>;

    const TestComponent = defineComponent({
      setup() {
        wrappedFn = useWithAbortSignal(mockFn);
        return {};
      },
      template: "<div>Test</div>",
    });

    const wrapper = mount(TestComponent);
    await new Promise(resolve => setTimeout(resolve, 0));

    // Call the wrapped function
    await wrappedFn!("arg1", "arg2");

    // Verify function was called with signal appended
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", expect.any(AbortSignal));

    wrapper.unmount();
  });

  it("should not append signal if last argument is already AbortSignal", async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: "test" });
    const existingController = new AbortController();
    const existingSignal = existingController.signal;
    let wrappedFn: ReturnType<typeof useWithAbortSignal<typeof mockFn>>;

    const TestComponent = defineComponent({
      setup() {
        wrappedFn = useWithAbortSignal(mockFn);
        return {};
      },
      template: "<div>Test</div>",
    });

    const wrapper = mount(TestComponent);
    await new Promise(resolve => setTimeout(resolve, 0));

    // Call with existing signal
    await wrappedFn!("arg1", existingSignal);

    // Verify function was called with existing signal, not a new one
    expect(mockFn).toHaveBeenCalledWith("arg1", existingSignal);

    wrapper.unmount();
  });

  it("should handle abort error gracefully", async () => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(
      (url, options) =>
        new Promise((resolve, reject) => {
          const signal = (options as RequestInit)?.signal as AbortSignal;
          if (signal) {
            signal.addEventListener("abort", () => {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              const error = new Error("Request aborted");
              error.name = "AbortError";
              reject(error);
            });
          }
          // Simulate slow request
          timeoutId = setTimeout(() => {
            timeoutId = null;
            resolve(new Response());
          }, 1000);
        }) as Promise<Response>,
    );

    let errorCaught: Error | null = null;

    const TestComponent = defineComponent({
      setup() {
        const fetchWithSignal = useFetch();
        onMounted(async () => {
          try {
            await fetchWithSignal("https://example.com/api");
          } catch (error) {
            errorCaught = error as Error;
          }
        });
        return {};
      },
      template: "<div>Test</div>",
    });

    const wrapper = mount(TestComponent);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Unmount immediately to trigger abort
    wrapper.unmount();
    await new Promise(resolve => setTimeout(resolve, 50));

    // Clean up any remaining timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Should have caught AbortError
    expect(errorCaught).toBeInstanceOf(Error);
    expect(errorCaught?.name).toBe("AbortError");

    fetchSpy.mockRestore();
  });
});
