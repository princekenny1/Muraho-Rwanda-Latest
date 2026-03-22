/* Payload CMS 3.0 — Admin Panel Catch-All */
import type { Metadata } from "next";
import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import { redirect } from "next/navigation";

import { importMap } from "../importMap.js";

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function sanitizeSearchParams(p: {
  [key: string]: string | string[] | undefined;
}): { [key: string]: string | string[] } {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export const generateMetadata = (args: Args): Promise<Metadata> =>
  generatePageMetadata({
    config,
    params: args.params.then((p) => ({ segments: p.segments ?? [] })),
    searchParams: args.searchParams.then(sanitizeSearchParams),
  });

async function Page(args: Args) {
  const params = await args.params;
  const searchParams = await args.searchParams;

  if (!params.segments || params.segments.length === 0) {
    redirect("/admin/collections/users");
  }

  return RootPage({
    config,
    importMap,
    params: Promise.resolve({ segments: params.segments ?? [] }),
    searchParams: Promise.resolve(sanitizeSearchParams(searchParams)),
  });
}

export default Page;
