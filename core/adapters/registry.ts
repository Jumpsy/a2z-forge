import type { AgentAdapter, AgentCapability } from "./agent-adapter.js";

export class AgentRegistry {
  readonly #adapters = new Map<string, AgentAdapter>();

  register(adapter: AgentAdapter): void {
    if (this.#adapters.has(adapter.id)) throw new Error(`Agent adapter already registered: ${adapter.id}`);
    this.#adapters.set(adapter.id, adapter);
  }

  async available(capability?: AgentCapability): Promise<AgentAdapter[]> {
    const candidates = [...this.#adapters.values()].filter((adapter) => !capability || adapter.capabilities.has(capability));
    const checks = await Promise.all(candidates.map(async (adapter) => ({ adapter, available: await adapter.available() })));
    return checks.filter(({ available }) => available).map(({ adapter }) => adapter);
  }

  require(id: string): AgentAdapter {
    const adapter = this.#adapters.get(id);
    if (!adapter) throw new Error(`Unknown agent adapter: ${id}`);
    return adapter;
  }
}
