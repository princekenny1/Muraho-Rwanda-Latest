import { getPayload } from "payload";
import config from "../payload.config";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@muraho.rw";

async function promoteAdmin() {
  const payload = await getPayload({ config });

  try {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: ADMIN_EMAIL } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (!existing.docs.length) {
      throw new Error(`User not found: ${ADMIN_EMAIL}`);
    }

    const user = existing.docs[0] as any;

    if (user.role === "admin") {
      payload.logger.info(`User already admin: ${ADMIN_EMAIL}`);
      return;
    }

    await payload.update({
      collection: "users",
      id: user.id,
      data: { role: "admin" },
      overrideAccess: true,
      depth: 0,
    });

    payload.logger.info(`Promoted user to admin: ${ADMIN_EMAIL}`);
  } finally {
    await payload.destroy();
  }
}

promoteAdmin().catch((error) => {
  console.error("Failed to promote admin:", error);
  process.exit(1);
});
