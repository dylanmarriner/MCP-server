import { createServer } from "@modelcontextprotocol/sdk/server";
import { registerWriteFileTool } from "./tools/write_file.js";

const server = createServer({
  name: "test-mcp",
  version: "test",
});

registerWriteFileTool(server);

// Directly invoke the tool handler
async function run() {
  try {
    const result = await server.tools.write_file({
      path: "src/modules/billing/test.ts",
      plan: "PHASE_5A_BILLING_RUNTIME",
      content: `
/**
 * ROLE: BOUNDARY
 * USED BY: BillingService
 * PURPOSE: Test boundary
 */
export interface Test {
  id: string;
}
      `,
    });

    console.log("SUCCESS:", result);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

run();
