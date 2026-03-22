import type { Metadata } from "next";
import type { ServerFunctionClient } from "payload";
import React from "react";
import "@payloadcms/next/css";
import config from "@payload-config";
import {
  handleServerFunctions,
  RootLayout as PayloadRootLayout,
} from "@payloadcms/next/layouts";

import { importMap } from "./(payload)/admin/importMap.js";

export const metadata: Metadata = {
  title: "Muraho Rwanda CMS",
  description: "Payload CMS Admin & API",
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PayloadRootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </PayloadRootLayout>
  );
}
