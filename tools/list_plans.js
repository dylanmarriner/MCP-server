import fs from "fs";
import path from "path";
import { resolveRepoRoot } from "../core/repo-resolver.js";

export async function listPlansHandler({ path: targetPath }) {
  if (!targetPath) {
    throw new Error("TARGET_PATH_REQUIRED");
  }

  const repoRoot = resolveRepoRoot(targetPath);
  const plansDir = path.join(repoRoot, "docs", "plans");

  const plans = fs
    .readdirSync(plansDir)
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(".md", ""));

  return {
    repoRoot,
    count: plans.length,
    plans,
  };
}
