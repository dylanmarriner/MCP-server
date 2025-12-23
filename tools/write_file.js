import fs from "fs";
import path from "path";

import { enforcePlan } from "../core/plan-enforcer.js";
import { extractRoleHeader } from "../core/role-parser.js";
import { parseRoleMetadata } from "../core/role-metadata.js";
import { validateRoleMetadata } from "../core/role-validator.js";
import { validateRoleMismatch } from "../core/role-mismatch-validator.js";
import { detectStubs } from "../core/stub-detector.js";

export async function writeFileHandler({ path: filePath, content, plan }) {
  if (!filePath || !content || !plan) {
    throw new Error(
      "INVALID_WRITE_REQUEST: path, content, and plan are required"
    );
  }

  if (filePath.includes("..")) {
    throw new Error("INVALID_PATH: directory traversal forbidden");
  }

  const normalizedPath = filePath.replace(/\\/g, "/");

  enforcePlan(plan, normalizedPath);

  const header = extractRoleHeader(content);
  const metadata = parseRoleMetadata(header);

  validateRoleMetadata(metadata);
  validateRoleMismatch(metadata.ROLE, content);
  detectStubs(content);

  const absolutePath = path.resolve(normalizedPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");

  return {
    status: "OK",
    plan,
    role: metadata.ROLE,
    path: normalizedPath,
  };
}

export function registerWriteFileTool(server) {
  server.tool("write_file", writeFileHandler);
}
