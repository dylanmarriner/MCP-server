import fs from "fs";
import path from "path";

/**
 * Resolve the repo root for a target path by walking upward
 * until a docs/plans directory is found.
 */
export function resolveRepoRoot(targetPath) {
  let current = path.resolve(targetPath);

  if (fs.existsSync(current) && fs.statSync(current).isFile()) {
    current = path.dirname(current);
  }

  while (true) {
    const plansDir = path.join(current, "docs", "plans");
    if (fs.existsSync(plansDir)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error(
    `NO_GOVERNED_REPO_FOUND: ${targetPath} is not inside a repo with docs/plans`
  );
}
