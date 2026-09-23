import type { FallbackReason } from "../../core/ai/contracts";

export class AIProviderError extends Error {
  readonly reason: FallbackReason;
  constructor(reason: FallbackReason) {
    super(reason);
    this.reason = reason;
    this.name = "AIProviderError";
  }
}
