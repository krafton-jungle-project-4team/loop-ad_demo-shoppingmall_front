import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const demoDataDir = path.join(rootDir, "src", "demo-data");
const assetsDir = path.join(demoDataDir, "assets");

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function main() {
  if (!(await exists(demoDataDir))) {
    throw new Error("src/demo-data is required even before fixtures are populated.");
  }

  if (!(await exists(assetsDir))) {
    throw new Error("src/demo-data/assets is required for local demo assets.");
  }

  const entries = await readdir(demoDataDir, { withFileTypes: true });
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.log("No demo data JSON fixtures yet. P2-001 will populate and extend validation.");
    return;
  }

  for (const file of jsonFiles) {
    const filePath = path.join(demoDataDir, file.name);
    const source = await readFile(filePath, "utf8");
    JSON.parse(source);
  }

  console.log(`Validated ${jsonFiles.length} demo data JSON file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
