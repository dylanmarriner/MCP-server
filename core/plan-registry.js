import fs from "fs";
import path from "path";

const PLAN_DIR = "./docs/plans";

export function loadPlans() {
  const plans = {};

  for (const file of fs.readdirSync(PLAN_DIR)) {
    if (!file.endsWith(".md")) continue;

    const content = fs.readFileSync(path.join(PLAN_DIR, file), "utf8");

    const id = content.match(/^ID:\s*(.+)$/m)?.[1];
    const status = content.match(/^STATUS:\s*(.+)$/m)?.[1];
    const scopeBlock = content.match(/^SCOPE:\n([\s\S]*?)(\n[A-Z]+:|\n$)/m)?.[1];

    if (!id || !status || !scopeBlock) continue;

    const scope = scopeBlock
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("- "))
      .map(l => l.slice(2));

    plans[id] = {
      status,
      scope,
      file,
    };
  }

  return plans;
}
