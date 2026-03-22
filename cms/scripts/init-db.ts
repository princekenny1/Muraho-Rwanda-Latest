/**
 * Direct database initialization script for Payload CMS 3.x
 * Bypasses CLI loader issues by directly initializing Payload and pushing schema.
 * Usage: npm run tsx scripts/init-db.ts
 */

import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "../payload.config.ts");

async function initDB() {
  console.log("🗂️  Loading config from:", configPath);

  try {
    // Dynamically import the config file
    const configModule = await import(configPath);
    const config = configModule.default;

    console.log("⚙️  Initializing Payload with schema push enabled...");

    // Initialize Payload instance with schema push enabled
    const payload = await getPayload({
      config: config,
    });

    console.log(
      "✅ Payload initialized. Schema has been pushed if in development mode.",
    );
    console.log("📊 Check your database for created tables.");

    // Clean up
    await payload.destroy();
    console.log("✓ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initDB();
