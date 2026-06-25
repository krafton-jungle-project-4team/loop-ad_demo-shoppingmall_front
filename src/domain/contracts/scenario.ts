import type { ScenarioId, SkuId } from "@/domain/contracts/ids";

export const DEFAULT_SCENARIO_ID: ScenarioId = "happy-path";

export type PaymentOutcome = "success" | "failure-once" | "failure";

export type DemoOperation =
  | "repository:list"
  | "repository:detail"
  | "checkout:payment"
  | "storage:recovery";

export type DemoOutcome =
  | { kind: "success" }
  | { kind: "failure"; reason: string }
  | { kind: "failure-once"; reason: string };

export interface DemoScenario {
  id: ScenarioId;
  label: string;
  repositoryDelayMs: number;
  paymentOutcome: PaymentOutcome;
  stockOverrides: Partial<Record<SkuId, number>>;
  forceStorageRecovery: boolean;
}

export interface ScenarioService {
  getActiveScenario(): DemoScenario;
  delayFor(operation: DemoOperation): Promise<void>;
  outcomeFor(operation: DemoOperation): DemoOutcome;
}
