import fs from "fs";
import path from "path";


import { enforcePlan } from "../core/plan-enforcer.js";
import { extractRoleHeader } from "../core/role-parser.js";
import { parseRoleMetadata } from "../core/role-metadata.js";
import { validateRoleMetadata } from "../core/role-validator.js";
import { validateRoleMismatch } from "../core/role-mismatch-validator.js";
import { detectStubs } from "../core/stub-detector.js";
import { appendAuditLog } from "../core/audit-log.js";
import { SESSION_ID } from "../session.js";

export async function writeFileHandler({
  path: filePath,
  content,
  plan,
  role,
  purpose,
  usedBy,
  connectedVia,
  registeredIn,
  executedVia,
  failureModes,
  authority,
}) {

  if (!filePath || !content || !plan) {
    throw new Error("INVALID_WRITE_REQUEST");
  }

  if (filePath.includes("..")) {
    throw new Error("INVALID_PATH");
  }

  const normalizedPath = filePath.replace(/\\/g, "/");

  const { repoRoot } = enforcePlan(plan, normalizedPath);

  let finalContent = content;

  if (role) {
    const h = [];
    h.push(`/**`);
    h.push(` * ROLE: ${role}`);
    if (registeredIn) h.push(` * REGISTERED IN: ${registeredIn}`);
    if (connectedVia) h.push(` * CONNECTED VIA: ${connectedVia}`);
    if (executedVia) h.push(` * EXECUTED VIA: ${executedVia}`);
    if (usedBy) h.push(` * USED BY: ${usedBy}`);
    if (purpose) h.push(` * PURPOSE: ${purpose}`);
    if (failureModes) h.push(` * FAILURE MODES: ${failureModes}`);

    h.push(` *`);
    if (authority) {
      h.push(` * Authority: ${authority}`);
    } else {
      h.push(` * Authority: ${plan}.md`);
    }
    h.push(` */`);

    finalContent = h.join("\n") + "\n\n" + content;
  }

  const header = extractRoleHeader(finalContent);
  const metadata = parseRoleMetadata(header);

  validateRoleMetadata(metadata);
  validateRoleMismatch(metadata.ROLE, finalContent);
  detectStubs(finalContent);

  const abs = path.resolve(normalizedPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, finalContent, "utf8");

  appendAuditLog(
    {
      plan,
      role: metadata.ROLE,
      path: normalizedPath,
      repoRoot,
    },
    SESSION_ID
  );

  return {
    status: "OK",
    plan,
    role: metadata.ROLE,
    path: normalizedPath,
    repoRoot,
  };
}
