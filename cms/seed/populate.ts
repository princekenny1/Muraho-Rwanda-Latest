#!/usr/bin/env node
/**
 * Muraho Rwanda - Comprehensive Seed Data
 * ========================================
 *
 * Populates the database with test data for all content types
 * Run: npm run seed:populate
 */

import fetch from "node-fetch";

const BASE_URL = process.env.SEED_BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@muraho.rw";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "MurahoAdmin2026!";

let adminToken: string;
let adminSession: any;

// ── Helper: API request with auth ──────────────────

async function apiFetch(path: string, method: string = "GET", body?: any) {
  const url = `${BASE_URL}/api${path}`;
  const headers: any = {
    "Content-Type": "application/json",
  };

  if (adminSession?.cookie) {
    headers.Cookie = adminSession.cookie;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...(adminSession?.cookie && { credentials: "include" }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }

  return response.json();
}

// ── Auth ───────────────────────────────────────────

async function authenticate() {
  console.log("🔐 Authenticating...");
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  const data = await response.json();
  adminToken = data.token;
  adminSession = { cookie: response.headers.get("set-cookie") };
  console.log("✅ Authenticated as", ADMIN_EMAIL);
}

// ── Seed: Themes ───────────────────────────────────

async function seedThemes() {
  console.log("\n📚 Seeding Themes...");
  const themes = [
    {
      title: "Colonial History",
      slug: "colonial-history",
      description: "Rwanda's colonial period",
    },
    {
      title: "Genocide Memorial",
      slug: "genocide-memorial",
      description: "1994 Genocide Against Tutsi",
    },
    {
      title: "Independence & Unity",
      slug: "independence-unity",
      description: "Post-genocide reconstruction",
    },
    {
      title: "Modern Rwanda",
      slug: "modern-rwanda",
      description: "Contemporary Rwanda",
    },
    {
      title: "Culture & Traditions",
      slug: "culture-traditions",
      description: "Rwandan cultural heritage",
    },
  ];

  for (const theme of themes) {
    try {
      await apiFetch("/themes", "POST", theme);
      console.log(`  ✅ ${theme.title}`);
    } catch (e) {
      console.error(`  ❌ ${theme.title}:`, e.message);
    }
  }
}

// ── Seed: Locations ────────────────────────────────

async function seedLocations() {
  console.log("\n📍 Seeding Locations...");
  const locations = [
    {
      title: "Kigali Memorial Centre",
      slug: "kigali-memorial",
      description: "Official memorial site",
      latitude: -1.947,
      longitude: 29.873,
    },
    {
      title: "Gisozi",
      slug: "gisozi",
      description: "Mass memorial grave site",
      latitude: -1.939,
      longitude: 29.893,
    },
    {
      title: "Nyamata Church",
      slug: "nyamata-church",
      description: "Genocide memorial site",
      latitude: -1.994,
      longitude: 30.269,
    },
    {
      title: "Murambi Technical School",
      slug: "murambi",
      description: "Memorial and museum",
      latitude: -2.596,
      longitude: 29.744,
    },
    {
      title: "Butare Prison",
      slug: "butare-prison",
      description: "Historical site",
      latitude: -2.594,
      longitude: 29.741,
    },
  ];

  for (const location of locations) {
    try {
      await apiFetch("/locations", "POST", location);
      console.log(`  ✅ ${location.title}`);
    } catch (e) {
      console.error(`  ❌ ${location.title}:`, e.message);
    }
  }
}

// ── Seed: People ───────────────────────────────────

async function seedPeople() {
  console.log("\n👥 Seeding People...");
  const people = [
    {
      name: "Paul Kagame",
      slug: "paul-kagame",
      bio: "President of Rwanda",
      role: "government",
    },
    {
      name: "Immaculée Ilibagiza",
      slug: "immaculee-ilibagiza",
      bio: "Genocide survivor and author",
      role: "survivor",
    },
    {
      name: "Thérèse Nyiramasuhuko",
      slug: "therese-nyiramasuhuko",
      bio: "Former Minister and war crimes convict",
      role: "accused",
    },
    {
      name: "Jean-Paul Akayesu",
      slug: "jean-paul-akayesu",
      bio: "Former mayor, convicted genocidaire",
      role: "accused",
    },
    {
      name: "Romeo Dallaire",
      slug: "romeo-dallaire",
      bio: "UN General during genocide",
      role: "international",
    },
  ];

  for (const person of people) {
    try {
      await apiFetch("/people", "POST", person);
      console.log(`  ✅ ${person.name}`);
    } catch (e) {
      console.error(`  ❌ ${person.name}:`, e.message);
    }
  }
}

// ── Seed: Stories ──────────────────────────────────

async function seedStories() {
  console.log("\n📖 Seeding Stories...");
  const stories = [
    {
      title: "The Path to Reconciliation",
      slug: "path-to-reconciliation",
      summary: "A survivor's journey",
      content: "Story of reconciliation after the genocide...",
      status: "published",
      isFeatured: true,
    },
    {
      title: "Voices from Gisozi",
      slug: "voices-from-gisozi",
      summary: "Memorial testimonies",
      content: "Testimonies collected at the Gisozi memorial...",
      status: "published",
      isFeatured: false,
    },
    {
      title: "The Kigali Genocide Memorial",
      slug: "kigali-memorial-story",
      summary: "History and significance",
      content: "Learn about the national memorial center...",
      status: "published",
      isFeatured: true,
    },
    {
      title: "Rwanda's Road to Recovery",
      slug: "road-to-recovery",
      summary: "Post-genocide rebuilding",
      content: "How Rwanda rebuilt after 1994...",
      status: "published",
      isFeatured: false,
    },
    {
      title: "Cultural Heritage Revival",
      slug: "cultural-heritage",
      summary: "Preserving traditions",
      content: "Traditional Rwandan culture and customs...",
      status: "published",
      isFeatured: true,
    },
  ];

  for (const story of stories) {
    try {
      await apiFetch("/stories", "POST", story);
      console.log(`  ✅ ${story.title}`);
    } catch (e) {
      console.error(`  ❌ ${story.title}:`, e.message);
    }
  }
}

// ── Seed: Museums ──────────────────────────────────

async function seedMuseums() {
  console.log("\n🏛️  Seeding Museums...");
  const museums = [
    {
      name: "Kigali Genocide Memorial",
      slug: "kigali-genocide-memorial",
      description: "National genocide memorial and museum",
      latitude: -1.947,
      longitude: 29.873,
      address: "PO Box 3748, Kigali",
      phone: "+250 (0)252 576 924",
      email: "kigali@genocidememorial.org",
      isActive: true,
    },
    {
      name: "Nyamata Church Memorial",
      slug: "nyamata-church-memorial",
      description: "Church turned memorial site",
      latitude: -1.994,
      longitude: 30.269,
      address: "Nyamata, Eastern Province",
      phone: "+250 (0)250 567 890",
      email: null,
      isActive: true,
    },
    {
      name: "Murambi Technical School Memorial",
      slug: "murambi-school-memorial",
      description: "Former school, now memorial",
      latitude: -2.596,
      longitude: 29.744,
      address: "Murambi, Southern Province",
      phone: "+250 (0)252 200 505",
      email: null,
      isActive: true,
    },
  ];

  for (const museum of museums) {
    try {
      await apiFetch("/museums", "POST", museum);
      console.log(`  ✅ ${museum.name}`);
    } catch (e) {
      console.error(`  ❌ ${museum.name}:`, e.message);
    }
  }
}

// ── Seed: Documentaries ────────────────────────────

async function seedDocumentaries() {
  console.log("\n🎬 Seeding Documentaries...");
  const documentaries = [
    {
      title: "Scream Without Sound",
      slug: "scream-without-sound",
      description: "Documentary about the genocide",
      status: "published",
      duration: 52,
    },
    {
      title: "Faces of Genocide",
      slug: "faces-of-genocide",
      description: "Personal stories of survivors",
      status: "published",
      duration: 45,
    },
    {
      title: "Rwanda Rising",
      slug: "rwanda-rising",
      description: "Post-genocide recovery documentary",
      status: "published",
      duration: 60,
    },
  ];

  for (const doc of documentaries) {
    try {
      await apiFetch("/documentaries", "POST", doc);
      console.log(`  ✅ ${doc.title}`);
    } catch (e) {
      console.error(`  ❌ ${doc.title}:`, e.message);
    }
  }
}

// ── Seed: Routes ───────────────────────────────────

async function seedRoutes() {
  console.log("\n🗺️  Seeding Routes...");
  const routes = [
    {
      title: "Genocide Memorial Trail",
      slug: "genocide-memorial-trail",
      description: "Visit major genocide memorial sites",
      status: "published",
      startPoint: "Kigali City Center",
      endPoint: "Gisozi Memorial",
      distance: 15,
    },
    {
      title: "Historical Kigali Tour",
      slug: "historical-kigali-tour",
      description: "Historical sites in Kigali",
      status: "published",
      startPoint: "Downtown Kigali",
      endPoint: "Airport District",
      distance: 25,
    },
  ];

  for (const route of routes) {
    try {
      await apiFetch("/routes", "POST", route);
      console.log(`  ✅ ${route.title}`);
    } catch (e) {
      console.error(`  ❌ ${route.title}:`, e.message);
    }
  }
}

// ── Main ────────────────────────────────────────────

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  Muraho Rwanda - Comprehensive Seed Data Script            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    await authenticate();

    await seedThemes();
    await seedLocations();
    await seedPeople();
    await seedStories();
    await seedMuseums();
    await seedDocumentaries();
    await seedRoutes();

    console.log("\n✅ Seed data population complete!");
    console.log("\nData Summary:");
    console.log("  • 5 Themes");
    console.log("  • 5 Locations");
    console.log("  • 5 People");
    console.log("  • 5 Stories");
    console.log("  • 3 Museums");
    console.log("  • 3 Documentaries");
    console.log("  • 2 Routes");
    console.log("\n📊 Total: 28 content items");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

main();
