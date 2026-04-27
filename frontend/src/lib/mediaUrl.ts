const LEGACY_CONTENT_ORIGINS = [
  "http://localhost:5173",
  "https://localhost:5173",
  "http://127.0.0.1:5173",
  "https://127.0.0.1:5173",
];

export const normalizeMediaUrl = (value?: string | null): string => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  for (const origin of LEGACY_CONTENT_ORIGINS) {
    if (trimmed.startsWith(origin + "/")) {
      return trimmed.slice(origin.length);
    }
  }

  return trimmed;
};
