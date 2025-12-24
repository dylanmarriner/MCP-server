import fs from "fs";
import path from "path";
import { resolveRepoRoot } from "./repo-resolver.js";

/**
 * Enforce that a plan exists in the repo governing the target path.
 */
export function enforcePlan(planName, targetPath) {
  if (!planName) {
    throw new Error("PLAN_NAME_REQUIRED");
  }

  const repoRoot = resolveRepoRoot(targetPath);
  const plansDir = path.join(repoRoot, "docs", "plans");

  // Normalize: get basename to strip paths (e.g. docs/plans/Foo.md -> Foo.md)
  // then strip .md extension if present
  const baseName = path.basename(planName);
  const normalizedPlanName = baseName.endsWith(".md")
    ? baseName.slice(0, -3)
    : baseName;

  const planFile = path.join(plansDir, `${normalizedPlanName}.md`);

  if (!fs.existsSync(planFile)) {
    throw new Error(
      `PLAN_NOT_APPROVED: ${planName} not found in ${plansDir}`
    );
  }

  return {
    repoRoot,
    plan: normalizedPlanName,
  };
}
