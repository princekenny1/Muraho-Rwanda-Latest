import type { CollectionConfig } from "payload";
import { isAdmin, isAdminOrSelf, adminOnly } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "fullName", "createdAt"],
    group: "Admin",
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: "fullName", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        { label: "User", value: "user" },
        { label: "Moderator", value: "moderator" },
        { label: "Agency Admin", value: "agency_admin" },
        { label: "Admin", value: "admin" },
      ],
      access: { update: adminOnly },
      admin: { position: "sidebar" },
    },
    {
      name: "agency",
      type: "relationship",
      relationTo: "tour-agencies",
      admin: { condition: (d) => d?.role === "agency_admin" },
    },
    {
      name: "preferredLanguage",
      type: "select",
      defaultValue: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
        { label: "Ikinyarwanda", value: "rw" },
      ],
    },
    {
      name: "accessTier",
      type: "select",
      defaultValue: "free",
      options: [
        { label: "Free", value: "free" },
        { label: "Day Pass", value: "day_pass" },
        { label: "Subscriber", value: "subscriber" },
        { label: "Agency", value: "agency" },
      ],
      admin: {
        position: "sidebar",
        description: "User's content access level",
      },
    },
    { name: "avatar", type: "upload", relationTo: "media" },
  ],
};
