import { createServer } from "@modelcontextprotocol/sdk/server";
import { registerWriteFileTool } from "./tools/write_file.js";

const server = createServer({
  name: "kaiza-mcp",
  version: "1.0.0",
});

// REGISTER TOOLS
registerWriteFileTool(server);

// START SERVER
server.start();
