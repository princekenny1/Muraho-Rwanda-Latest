import type { Access, FieldAccess } from "payload";

export const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user?.role === "admin") return true;
  if (!user) return false;
  return { user: { equals: user.id } };
};

export const publicRead: Access = () => true;

export const publicReadAdminWrite = {
  read: publicRead,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};

export const isOwnerOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return { user: { equals: user.id } };
};

export const ownerAccess = {
  read: isOwnerOrAdmin,
  create: ({ req: { user } }: any) => !!user,
  update: isOwnerOrAdmin,
  delete: isOwnerOrAdmin,
};

export const publishedOrAdmin: Access = ({ req: { user } }) => {
  if (user?.role === "admin") return true;
  return { status: { equals: "published" } };
};

export const adminOnly: FieldAccess = ({ req: { user } }) => user?.role === "admin";
