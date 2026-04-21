import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

/**
 * Execute an MCP tool call via the manus-mcp-cli utility.
 * Returns the raw text output from the tool result.
 */
export async function execMcpTool(
  server: string,
  tool: string,
  input: Record<string, unknown>
): Promise<string> {
  const inputJson = JSON.stringify(input);
  const escapedInput = inputJson.replace(/'/g, "'\\''");

  const { stdout, stderr } = await execAsync(
    `manus-mcp-cli tool call ${tool} --server ${server} --input '${escapedInput}'`,
    { timeout: 60000 }
  );

  // The result is saved to a file — find the path from stdout
  const savedMatch = stdout.match(/MCP tool invocation result saved to:\s*(\S+)/);
  if (savedMatch) {
    try {
      const resultContent = await fs.readFile(savedMatch[1], "utf-8");
      return resultContent;
    } catch {
      // Fall through to stdout
    }
  }

  return stdout + (stderr || "");
}
