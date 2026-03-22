const BASE_URL = process.env.SEED_BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@muraho.rw";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "MurahoAdmin2026!";

const LOGIN_CANDIDATES = [
  { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { email: "admin@muraho-cms.rw", password: "Admin@12345" },
].filter(
  (value, index, arr) =>
    arr.findIndex(
      (item) => item.email === value.email && item.password === value.password,
    ) === index,
);

async function jsonRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  let body: any = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { response, body };
}

async function ensureAdminUser() {
  const minimalRegister = await jsonRequest("/api/users/first-register", {
    method: "POST",
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const register = minimalRegister.response.ok
    ? minimalRegister
    : await jsonRequest("/api/users/first-register", {
        method: "POST",
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          fullName: "Admin",
          role: "admin",
        }),
      });

  if (register.response.ok) {
    console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
    return;
  }

  if (
    register.response.status === 400 ||
    register.response.status === 403 ||
    register.response.status === 409
  ) {
    console.log(`ℹ️ Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const existingLogin = await jsonRequest("/api/users/login", {
    method: "POST",
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (existingLogin.response.ok && existingLogin.body?.token) {
    console.log(
      `ℹ️ first-register returned ${register.response.status}, but admin login succeeded; continuing`,
    );
    return;
  }

  throw new Error(
    `Admin bootstrap failed (${register.response.status}): ${JSON.stringify(register.body)}`,
  );
}

async function verifyLogin() {
  for (const candidate of LOGIN_CANDIDATES) {
    const login = await jsonRequest("/api/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: candidate.email,
        password: candidate.password,
      }),
    });

    if (login.response.ok && login.body?.token) {
      console.log(`✅ Admin login verified (${candidate.email})`);
      return candidate.email;
    }
  }

  throw new Error("Login verification failed for known admin credentials");
}

async function seed() {
  console.log(`🌱 Seeding Muraho CMS via API at ${BASE_URL}`);

  const health = await jsonRequest("/api/health", { method: "GET" });
  if (health.response.status >= 500) {
    console.log(
      `ℹ️ Health endpoint returned ${health.response.status}; continuing seed because CMS is reachable`,
    );
  }

  await ensureAdminUser();
  const verifiedEmail = await verifyLogin();

  console.log("🎉 Seed complete");
  console.log(`   URL: ${BASE_URL}/admin`);
  console.log(`   Email: ${verifiedEmail}`);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
