import { getPayload } from "payload";
import config from "../payload.config";

async function bootstrapSchema() {
  const payload = await getPayload({ config });
  payload.logger.info("Payload schema bootstrap complete");
  await payload.destroy();
}

bootstrapSchema().catch((error) => {
  console.error("Schema bootstrap failed:", error);
  process.exit(1);
});
