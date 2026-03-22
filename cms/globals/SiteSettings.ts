import type { GlobalConfig } from "payload";
import { isAdmin } from "../access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Admin" },
  access: { read: () => true, update: isAdmin },
  fields: [
    { name: "siteName", type: "text", defaultValue: "Muraho Rwanda" },
    { name: "tagline", type: "text", localized: true },
    { name: "contactEmail", type: "email" },
    { name: "socialLinks", type: "group", fields: [
      { name: "twitter", type: "text" },
      { name: "instagram", type: "text" },
      { name: "youtube", type: "text" },
    ]},
    { name: "maintenanceMode", type: "checkbox", defaultValue: false },
    { name: "defaultLanguage", type: "select", defaultValue: "en", options: [
      { label: "English", value: "en" }, { label: "Français", value: "fr" }, { label: "Ikinyarwanda", value: "rw" },
    ]},
  ],
};
