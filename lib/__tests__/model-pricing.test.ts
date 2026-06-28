import { describe, it, expect, vi, afterEach } from "vitest";

// getModelPricing memoizes its fetch in module scope, so reset the module
// registry between tests to get a fresh, uncached instance each time.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function modelsResponse(data: unknown[]) {
  return { ok: true, json: async () => ({ data }) };
}

describe("getModelPricing", () => {
  it("maps prompt/completion pricing and returns null for unknown ids", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        modelsResponse([
          {
            id: "vendor/model-a",
            pricing: { prompt: "0.000001", completion: "0.000002" },
          },
          { id: "vendor/no-pricing" },
        ])
      )
    );

    const { getModelPricing } = await import("../model-pricing");
    expect(await getModelPricing("vendor/model-a")).toEqual({
      prompt: 0.000001,
      completion: 0.000002,
    });
    expect(await getModelPricing("vendor/unknown")).toBeNull();
  });

  it("returns null when the network request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );

    const { getModelPricing } = await import("../model-pricing");
    expect(await getModelPricing("vendor/model-a")).toBeNull();
  });

  it("returns null on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 }))
    );

    const { getModelPricing } = await import("../model-pricing");
    expect(await getModelPricing("vendor/model-a")).toBeNull();
  });
});
