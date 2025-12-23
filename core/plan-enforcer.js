import path from "path";
import minimatch from "minimatch";
import { loadPlans } from "./plan-registry.js";

export function enforcePlan(planId, filePath) {
  const plans = loadPlans();
  const plan = plans[planId];

  if (!plan) {
    throw new Error(`PLAN_NOT_FOUND: ${planId}`);
  }

  if (plan.status !== "APPROVED") {
    throw new Error(`PLAN_NOT_APPROVED: ${planId}`);
  }

  const normalized = filePath.replace(/\\/g, "/");

  const allowed = plan.scope.some(pattern =>
    minimatch(normalized, pattern)
  );

  if (!allowed) {
    throw new Error(
      `PLAN_SCOPE_VIOLATION: ${filePath} not allowed by ${planId}`
    );
  }

  return true;
}
