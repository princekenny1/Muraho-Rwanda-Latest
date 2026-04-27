const BASE_URL = process.env.SEED_BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@muraho.rw";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "MurahoAdmin2026!";
const CONTENT_BASE = (process.env.SEED_CONTENT_BASE || "")
  .trim()
  .replace(/\/+$/, "");

const contentUrl = (path: string): string =>
  CONTENT_BASE ? `${CONTENT_BASE}${path}` : path;

type AuthSession = {
  email: string;
  token: string;
};

const LOGIN_CANDIDATES = [
  { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { email: "admin@muraho-cms.rw", password: "Admin@12345" },
].filter(
  (value, index, arr) =>
    arr.findIndex(
      (item) => item.email === value.email && item.password === value.password,
    ) === index,
);

const MEDIA = {
  routeMusanze: contentUrl("/content/routes/musanze.jpg"),
  routeIbirunga: contentUrl("/content/routes/ibirunga.jpg"),
  routeLakeKivu: contentUrl("/content/routes/lake-kivu-medium.jpg"),
  routeLakeShore: contentUrl("/content/routes/lake-kivu-shore.webp"),
  memorialKigali: contentUrl("/content/memorials/kigali-genocide-memorial.jpg"),
  memorialMurambi: contentUrl("/content/memorials/murambi-genocide-memorial.jpg"),
  memorialNyanza: contentUrl("/content/memorials/nyanza-memorial.jpg"),
  testimonyIbuka: contentUrl("/content/testimonials/ibuka.jpg"),
  testimonyRwanda2019: contentUrl("/content/testimonials/rwanda-2019.jpg"),
  testimonyFacebook: contentUrl("/content/testimonials/rwanda-facebook-jumbo.jpg"),
  testimonyKigali: contentUrl("/content/testimonials/kigali-testimony.avif"),
} as const;

const MUSEUM_SEED = [
  {
    name: "Kigali Genocide Memorial",
    slug: "kigali-genocide-memorial",
    shortDescription:
      "National memorial honoring victims of the 1994 Genocide against the Tutsi and documenting Rwanda's path to remembrance.",
    coverImage: MEDIA.memorialKigali,
    address: "KG 14 Ave, Gisozi, Kigali",
    latitude: -1.9148,
    longitude: 30.0663,
    openingHours: { daily: "08:00 - 17:00" },
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Murambi Genocide Memorial",
    slug: "murambi-genocide-memorial",
    shortDescription:
      "Former technical school preserving testimony and evidence from one of the largest massacre sites in Southern Province.",
    coverImage: MEDIA.memorialMurambi,
    address: "Murambi, Nyamagabe District",
    latitude: -2.5859,
    longitude: 29.5744,
    openingHours: { daily: "08:00 - 17:00" },
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Nyanza Genocide Memorial",
    slug: "nyanza-genocide-memorial",
    shortDescription:
      "A memorial site in Nyanza preserving names, artifacts, and educational context for visitors and students.",
    coverImage: MEDIA.memorialNyanza,
    address: "Nyanza District, Southern Province",
    latitude: -2.3496,
    longitude: 29.7499,
    openingHours: { daily: "09:00 - 17:00" },
    isFeatured: false,
    isActive: true,
  },
];

const TESTIMONY_SEED = [
  {
    title: "A Morning That Changed Everything",
    slug: "a-morning-that-changed-everything",
    personName: "Mujawamariya Claudine",
    context: "Kigali, April 1994 - Survivor testimony",
    coverImage: MEDIA.testimonyIbuka,
    category: "survivor",
    location: "Kigali",
    year: 1994,
    durationMinutes: 9,
    hasContentWarning: true,
    isFeatured: true,
    transcriptSegments: [
      {
        time: 0,
        text: "I remember the silence before dawn. We knew fear had arrived before the first light.",
      },
      {
        time: 48,
        text: "Neighbors protected one another with whatever courage they had left.",
      },
      {
        time: 112,
        text: "Today I speak for those who cannot, so our children learn the truth with dignity.",
      },
    ],
    sources: [{ name: "Muraho Oral History Program" }],
  },
  {
    title: "Shelter at the Parish Gate",
    slug: "shelter-at-the-parish-gate",
    personName: "Niyigena Samuel",
    context: "Nyamata, 1994 - Witness and community volunteer",
    coverImage: MEDIA.testimonyRwanda2019,
    category: "witness",
    location: "Nyamata",
    year: 1994,
    durationMinutes: 11,
    hasContentWarning: true,
    isFeatured: true,
    transcriptSegments: [
      {
        time: 0,
        text: "People came to the church because it felt like the safest place left.",
      },
      {
        time: 70,
        text: "After the violence, we began collecting names so no family would be forgotten.",
      },
      {
        time: 155,
        text: "Memory is heavy, but it is also the beginning of healing.",
      },
    ],
    sources: [{ name: "Community Archive Nyamata" }],
  },
  {
    title: "Choosing to Protect",
    slug: "choosing-to-protect",
    personName: "Mukasarasi Esperance",
    context: "Huye, 1994 - Rescuer testimony",
    coverImage: MEDIA.testimonyFacebook,
    category: "rescuer",
    location: "Huye",
    year: 1994,
    durationMinutes: 8,
    hasContentWarning: true,
    isFeatured: false,
    transcriptSegments: [
      {
        time: 0,
        text: "We hid children in the storeroom and brought food at night.",
      },
      {
        time: 52,
        text: "Every decision carried risk, but doing nothing was not possible.",
      },
      {
        time: 126,
        text: "What matters now is teaching courage and humanity to the next generation.",
      },
    ],
    sources: [{ name: "Local Testimony Initiative, Huye" }],
  },
  {
    title: "Building Peace in the Same Village",
    slug: "building-peace-in-the-same-village",
    personName: "Habimana Jean Bosco",
    context: "Musanze, 2003 - Reconciliation testimony",
    coverImage: MEDIA.testimonyKigali,
    category: "reconciliation",
    location: "Musanze",
    year: 2003,
    durationMinutes: 10,
    hasContentWarning: false,
    isFeatured: false,
    transcriptSegments: [
      {
        time: 0,
        text: "Reconciliation did not happen in one meeting; it happened in many small acts.",
      },
      {
        time: 59,
        text: "We rebuilt homes together before we found all the words to explain our pain.",
      },
      {
        time: 140,
        text: "Today, young people in our village lead remembrance activities with respect.",
      },
    ],
    sources: [{ name: "Musanze Reconciliation Forum" }],
  },
] as const;

const ROUTE_SEED = [
  {
    title: "Kigali to Musanze Remembrance Journey",
    slug: "kigali-musanze-remembrance-journey",
    description:
      "Travel from Kigali to Musanze through stories of remembrance, resilience, and Rwanda's living landscape.",
    coverImage: MEDIA.routeMusanze,
    durationMinutes: 260,
    difficulty: "easy",
    distanceKm: 116,
    status: "published",
    routePath: {
      type: "LineString",
      coordinates: [
        [30.0619, -1.9441],
        [29.965, -1.859],
        [29.8872, -1.6894],
        [29.6348, -1.4996],
      ],
    },
    stops: [
      {
        title: "Kigali City Start",
        description: "Departure point with orientation and route context.",
        latitude: -1.9441,
        longitude: 30.0619,
        stopOrder: 1,
        estimatedTimeMinutes: 10,
        markerColor: "#0f766e",
        markerIcon: "location",
        contentBlocks: [
          {
            blockType: "image",
            blockOrder: 1,
            content: {
              images: [
                {
                  url: MEDIA.routeIbirunga,
                  caption: "A first glimpse of the northern highlands.",
                },
              ],
            },
          },
        ],
      },
      {
        title: "Rulindo Hills",
        description: "Stories and viewpoints across terraced hillsides.",
        latitude: -1.6894,
        longitude: 29.8872,
        stopOrder: 2,
        estimatedTimeMinutes: 18,
        markerColor: "#c46a4a",
        markerIcon: "culture",
        contentBlocks: [
          {
            blockType: "image",
            blockOrder: 1,
            content: {
              images: [
                {
                  url: MEDIA.routeLakeKivu,
                  caption:
                    "Landscape textures and village life along the route.",
                },
              ],
            },
          },
        ],
      },
      {
        title: "Musanze Arrival",
        description: "Arrival in the district near the Virunga foothills.",
        latitude: -1.4996,
        longitude: 29.6348,
        stopOrder: 3,
        estimatedTimeMinutes: 15,
        markerColor: "#4B5573",
        markerIcon: "history",
        contentBlocks: [
          {
            blockType: "image",
            blockOrder: 1,
            content: {
              images: [
                {
                  url: MEDIA.routeLakeShore,
                  caption: "Northern region roads and destination highlights.",
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    title: "Lake Kivu Cultural Route",
    slug: "lake-kivu-cultural-route",
    description:
      "A lakeside route connecting cultural memory sites and scenic community stops.",
    coverImage: MEDIA.routeLakeKivu,
    durationMinutes: 210,
    difficulty: "moderate",
    distanceKm: 88,
    status: "published",
    routePath: {
      type: "LineString",
      coordinates: [
        [29.7394, -2.473],
        [29.3561, -2.2648],
        [29.2507, -2.0361],
      ],
    },
    stops: [
      {
        title: "Karongi Lakefront",
        description: "Opening segment with local oral history at the shore.",
        latitude: -2.473,
        longitude: 29.7394,
        stopOrder: 1,
        estimatedTimeMinutes: 12,
        markerColor: "#0f766e",
        markerIcon: "nature",
        contentBlocks: [
          {
            blockType: "image",
            blockOrder: 1,
            content: {
              images: [
                { url: MEDIA.routeLakeShore, caption: "Lake Kivu shoreline." },
              ],
            },
          },
        ],
      },
      {
        title: "Rubavu Promenade",
        description: "Community stories and reflection points along the lake.",
        latitude: -1.6762,
        longitude: 29.258,
        stopOrder: 2,
        estimatedTimeMinutes: 15,
        markerColor: "#f59e0b",
        markerIcon: "culture",
        contentBlocks: [
          {
            blockType: "image",
            blockOrder: 1,
            content: {
              images: [
                {
                  url: MEDIA.routeMusanze,
                  caption: "View from the western corridor.",
                },
              ],
            },
          },
        ],
      },
    ],
  },
] as const;

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

function buildWhereQuery(where: Record<string, any>): string {
  const params = new URLSearchParams();

  const walk = (value: any, keyPath: string) => {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      for (const [childKey, childValue] of Object.entries(value)) {
        walk(childValue, `${keyPath}[${childKey}]`);
      }
      return;
    }

    params.set(keyPath, String(value));
  };

  walk(where, "where");
  return params.toString();
}

async function authedJsonRequest(
  session: AuthSession,
  path: string,
  init: RequestInit = {},
) {
  return jsonRequest(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.token}`,
      ...(init.headers || {}),
    },
  });
}

async function findOneByWhere(
  session: AuthSession,
  collection: string,
  where: Record<string, any>,
) {
  const whereQuery = buildWhereQuery(where);
  const result = await authedJsonRequest(
    session,
    `/api/${collection}?${whereQuery}&limit=1&depth=0`,
    { method: "GET" },
  );

  if (!result.response.ok) {
    throw new Error(
      `Failed to query ${collection}: ${result.response.status} ${JSON.stringify(result.body)}`,
    );
  }

  return Array.isArray(result.body?.docs) && result.body.docs.length > 0
    ? result.body.docs[0]
    : null;
}

function unwrapDoc<T = any>(body: any): T {
  return (body?.doc || body) as T;
}

async function upsertBySlug(
  session: AuthSession,
  collection: string,
  slug: string,
  data: Record<string, unknown>,
) {
  const existing = await findOneByWhere(session, collection, {
    slug: { equals: slug },
  });

  if (existing?.id) {
    const updated = await authedJsonRequest(
      session,
      `/api/${collection}/${existing.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    if (!updated.response.ok) {
      throw new Error(
        `Failed to update ${collection}/${slug}: ${updated.response.status} ${JSON.stringify(updated.body)}`,
      );
    }

    return unwrapDoc(updated.body);
  }

  const created = await authedJsonRequest(session, `/api/${collection}`, {
    method: "POST",
    body: JSON.stringify({ slug, ...data }),
  });

  if (!created.response.ok) {
    throw new Error(
      `Failed to create ${collection}/${slug}: ${created.response.status} ${JSON.stringify(created.body)}`,
    );
  }

  return unwrapDoc(created.body);
}

async function upsertRouteStop(
  session: AuthSession,
  routeId: string,
  existingStopId: string | null,
  stop: (typeof ROUTE_SEED)[number]["stops"][number],
) {
  const payload = {
    route: routeId,
    title: stop.title,
    description: stop.description,
    latitude: stop.latitude,
    longitude: stop.longitude,
    stopOrder: stop.stopOrder,
    estimatedTimeMinutes: stop.estimatedTimeMinutes,
    markerColor: stop.markerColor,
    markerIcon: stop.markerIcon,
    contentBlocks: stop.contentBlocks,
  };

  if (existingStopId) {
    const updated = await authedJsonRequest(
      session,
      `/api/route-stops/${existingStopId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    if (!updated.response.ok) {
      throw new Error(
        `Failed to update route stop ${stop.title}: ${updated.response.status} ${JSON.stringify(updated.body)}`,
      );
    }

    return unwrapDoc(updated.body);
  }

  const created = await authedJsonRequest(session, "/api/route-stops", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!created.response.ok) {
    throw new Error(
      `Failed to create route stop ${stop.title}: ${created.response.status} ${JSON.stringify(created.body)}`,
    );
  }

  return unwrapDoc(created.body);
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

async function verifyLogin(): Promise<AuthSession> {
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
      return { email: candidate.email, token: login.body.token };
    }
  }

  throw new Error("Login verification failed for known admin credentials");
}

async function seedMuseums(session: AuthSession) {
  console.log("🏛️  Seeding museums...");

  for (const museum of MUSEUM_SEED) {
    await upsertBySlug(session, "museums", museum.slug, {
      name: museum.name,
      shortDescription: museum.shortDescription,
      coverImage: museum.coverImage,
      address: museum.address,
      latitude: museum.latitude,
      longitude: museum.longitude,
      openingHours: museum.openingHours,
      isFeatured: museum.isFeatured,
      isActive: museum.isActive,
      _status: "published",
    });
    console.log(`   - ${museum.name}`);
  }
}

async function seedTestimonies(session: AuthSession) {
  console.log("🗣️  Seeding testimonies...");

  for (const testimony of TESTIMONY_SEED) {
    await upsertBySlug(session, "testimonies", testimony.slug, {
      title: testimony.title,
      personName: testimony.personName,
      context: testimony.context,
      coverImage: testimony.coverImage,
      category: testimony.category,
      location: testimony.location,
      year: testimony.year,
      durationMinutes: testimony.durationMinutes,
      hasContentWarning: testimony.hasContentWarning,
      isFeatured: testimony.isFeatured,
      transcriptSegments: testimony.transcriptSegments,
      sources: testimony.sources,
      _status: "published",
    });
    console.log(`   - ${testimony.title}`);
  }
}

async function seedRoutes(session: AuthSession) {
  console.log("🗺️  Seeding routes and stops...");

  for (const route of ROUTE_SEED) {
    const seededRoute = await upsertBySlug(session, "routes", route.slug, {
      title: route.title,
      description: route.description,
      coverImage: route.coverImage,
      durationMinutes: route.durationMinutes,
      difficulty: route.difficulty,
      distanceKm: route.distanceKm,
      status: route.status,
      publishedAt: new Date().toISOString(),
      routePath: route.routePath,
      _status: "published",
    });

    const stopIds: string[] = [];
    const existingStopIds: string[] = Array.isArray(seededRoute.stops)
      ? seededRoute.stops
          .map((stop: any) =>
            typeof stop === "string" ? stop : (stop?.id ?? null),
          )
          .filter((id: string | null): id is string => !!id)
      : [];

    for (const stop of route.stops) {
      const seededStop = await upsertRouteStop(
        session,
        seededRoute.id,
        existingStopIds[stop.stopOrder - 1] || null,
        stop,
      );
      if (seededStop?.id) {
        stopIds.push(seededStop.id);
      }
    }

    const routeUpdate = await authedJsonRequest(
      session,
      `/api/routes/${seededRoute.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          stops: stopIds,
          status: route.status,
          routePath: route.routePath,
          _status: "published",
        }),
      },
    );

    if (!routeUpdate.response.ok) {
      throw new Error(
        `Failed to patch route stops for ${route.title}: ${routeUpdate.response.status} ${JSON.stringify(routeUpdate.body)}`,
      );
    }

    console.log(`   - ${route.title} (${stopIds.length} stops)`);
  }
}

async function seedContent(session: AuthSession) {
  await seedMuseums(session);
  await seedTestimonies(session);
  await seedRoutes(session);
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
  const session = await verifyLogin();
  await seedContent(session);

  console.log("🎉 Seed complete");
  console.log(`   URL: ${BASE_URL}/admin`);
  console.log(`   Email: ${session.email}`);
  console.log(`   Content base: ${CONTENT_BASE}`);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
