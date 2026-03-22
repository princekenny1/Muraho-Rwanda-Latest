#!/usr/bin/env ts-node
/**
 * Muraho Rwanda — Content Migration Tool
 * ========================================
 * Bulk imports content from CSV/JSON files into Payload CMS.
 *
 * Usage:
 *   npx ts-node --esm migrate/index.ts --type museums --file data/museums.json
 *   npx ts-node --esm migrate/index.ts --type stories --file data/stories.csv
 *   npx ts-node --esm migrate/index.ts --type testimonies --file data/testimonies.json --dry-run
 *
 * Supported formats: .json (array of objects), .csv (with headers)
 * Supported types: museums, locations, stories, testimonies, documentaries, routes
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const API_BASE = process.env.CMS_URL || "http://localhost:3000/api";
let AUTH_TOKEN = "";

// ── CLI args ──────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}

const contentType = getArg("type") || "";
const filePath = getArg("file") || "";
const dryRun = args.includes("--dry-run");
const email = getArg("email") || "admin@muraho.rw";
const password = getArg("password") || "MurahoAdmin2026!";

if (!contentType || !filePath) {
  console.error("Usage: migrate --type <collection> --file <path> [--dry-run] [--email <email>] [--password <pw>]");
  console.error("Types: museums, locations, stories, testimonies, documentaries, routes");
  process.exit(1);
}

// ── Auth ──────────────────────────────────────────────

async function authenticate(): Promise<void> {
  const resp = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) throw new Error(`Auth failed: ${resp.status}`);
  const data = await resp.json();
  AUTH_TOKEN = data.token;
  console.log(`✓ Authenticated as ${data.user.email}`);
}

async function apiCreate(collection: string, data: Record<string, any>): Promise<any> {
  const resp = await fetch(`${API_BASE}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${AUTH_TOKEN}`,
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ message: resp.statusText }));
    throw new Error(`Create ${collection} failed: ${JSON.stringify(err)}`);
  }

  return resp.json();
}

// ── File parsing ──────────────────────────────────────

function loadFile(filepath: string): Record<string, any>[] {
  const ext = path.extname(filepath).toLowerCase();
  const content = fs.readFileSync(filepath, "utf-8");

  if (ext === ".json") {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (ext === ".csv" || ext === ".tsv") {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ext === ".tsv" ? "\t" : ",",
      cast: true,
      cast_date: false,
    });
  }

  throw new Error(`Unsupported file format: ${ext}. Use .json, .csv, or .tsv`);
}

// ── Field mapping per collection ──────────────────────

interface FieldMapper {
  (row: Record<string, any>): Record<string, any>;
}

const MAPPERS: Record<string, FieldMapper> = {
  museums: (row) => ({
    name: row.name || row.title,
    slug: slugify(row.name || row.title),
    description: row.description || "",
    latitude: parseFloat(row.latitude || row.lat),
    longitude: parseFloat(row.longitude || row.lng || row.lon),
    address: row.address || "",
    openingHours: row.openingHours || row.opening_hours || "",
    contactPhone: row.contactPhone || row.phone || "",
    contactEmail: row.contactEmail || row.email || "",
    isActive: row.isActive !== false && row.is_active !== "false",
    isFeatured: row.isFeatured === true || row.is_featured === "true",
  }),

  locations: (row) => ({
    name: row.name || row.title,
    slug: slugify(row.name || row.title),
    description: row.description || "",
    locationType: row.locationType || row.location_type || row.type || "cultural_site",
    latitude: parseFloat(row.latitude || row.lat),
    longitude: parseFloat(row.longitude || row.lng || row.lon),
    province: row.province || "",
    district: row.district || "",
    isActive: row.isActive !== false && row.is_active !== "false",
  }),

  stories: (row) => ({
    title: row.title,
    slug: slugify(row.title),
    summary: row.summary || row.description || "",
    description: row.description || "",
    language: row.language || "en",
    sensitivityLevel: row.sensitivityLevel || row.sensitivity || "standard",
    status: row.status || "draft",
    isFeatured: row.isFeatured === true || row.is_featured === "true",
    estimatedReadMinutes: parseInt(row.estimatedReadMinutes || row.read_time || "5"),
  }),

  testimonies: (row) => ({
    title: row.title,
    slug: slugify(row.title),
    survivorName: row.survivorName || row.survivor_name || row.name || "Anonymous",
    summary: row.summary || "",
    biography: row.biography || row.bio || "",
    language: row.language || "en",
    isPublished: row.isPublished !== false && row.is_published !== "false",
  }),

  documentaries: (row) => ({
    title: row.title,
    slug: slugify(row.title),
    description: row.description || "",
    synopsis: row.synopsis || "",
    durationMinutes: parseInt(row.durationMinutes || row.duration || "0"),
    releaseYear: parseInt(row.releaseYear || row.year || "0") || undefined,
  }),

  routes: (row) => ({
    title: row.title,
    slug: slugify(row.title),
    description: row.description || "",
    estimatedDurationMinutes: parseInt(row.estimatedDurationMinutes || row.duration || "60"),
    distanceKm: parseFloat(row.distanceKm || row.distance || "0"),
    difficulty: row.difficulty || "moderate",
    status: row.status || "draft",
  }),
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

// ── Main ──────────────────────────────────────────────

async function main() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  Muraho Rwanda — Content Migration");
  console.log("═══════════════════════════════════════════\n");
  console.log(`  Collection: ${contentType}`);
  console.log(`  File:       ${filePath}`);
  console.log(`  Dry run:    ${dryRun}`);
  console.log("");

  const mapper = MAPPERS[contentType];
  if (!mapper) {
    console.error(`Unknown content type: ${contentType}`);
    console.error(`Supported: ${Object.keys(MAPPERS).join(", ")}`);
    process.exit(1);
  }

  // Load file
  const rows = loadFile(filePath);
  console.log(`✓ Loaded ${rows.length} records from ${path.basename(filePath)}\n`);

  if (rows.length === 0) {
    console.log("  No records to import.");
    return;
  }

  // Show first record as preview
  const preview = mapper(rows[0]);
  console.log("  Preview (first record):");
  console.log(`  ${JSON.stringify(preview, null, 2).split("\n").join("\n  ")}\n`);

  if (dryRun) {
    console.log(`  DRY RUN: Would import ${rows.length} ${contentType}.`);
    return;
  }

  // Authenticate
  await authenticate();

  // Import
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const mapped = mapper(row);
      await apiCreate(contentType, mapped);
      success++;
      process.stdout.write(`  Importing: ${success}/${rows.length}\r`);
    } catch (err: any) {
      failed++;
      const name = row.name || row.title || `row ${i + 1}`;
      errors.push(`  ✗ ${name}: ${err.message}`);
    }
  }

  console.log("\n");
  console.log("═══════════════════════════════════════════");
  console.log(`  Results: ${success} imported, ${failed} failed`);
  console.log("═══════════════════════════════════════════\n");

  if (errors.length > 0) {
    console.log("  Errors:");
    errors.forEach((e) => console.log(e));
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
