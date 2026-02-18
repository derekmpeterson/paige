export interface ModelPricing {
  prompt: number; // cost per input token
  completion: number; // cost per output token
}

let fetchPromise: Promise<Map<string, ModelPricing>> | null = null;

async function fetchPricingMap(): Promise<Map<string, ModelPricing>> {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`OpenRouter /models: ${res.status}`);
  const { data } = await res.json();
  const map = new Map<string, ModelPricing>();
  for (const model of data) {
    if (model.pricing) {
      map.set(model.id, {
        prompt: Number(model.pricing.prompt) || 0,
        completion: Number(model.pricing.completion) || 0,
      });
    }
  }
  return map;
}

export async function getModelPricing(
  modelId: string
): Promise<ModelPricing | null> {
  try {
    if (!fetchPromise) {
      fetchPromise = fetchPricingMap();
    }
    const map = await fetchPromise;
    return map.get(modelId) ?? null;
  } catch {
    fetchPromise = null; // allow retry on next request
    return null;
  }
}
