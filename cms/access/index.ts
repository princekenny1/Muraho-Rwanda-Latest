import type { Access, FieldAccess } from "payload";

export const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

export const isModerator: Access = ({ req: { user } }) =>
  user?.role === "moderator";

export const isEditor: Access = ({ req: { user } }) =>
  user?.role === "admin" || user?.role === "moderator";

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user?.role === "admin") return true;
  if (!user) return false;
  return { user: { equals: user.id } };
};

// Users collection access must filter by the primary id field, not "user".
export const isAdminOrSelfUserRecord: Access = ({ req: { user } }) => {
  if (user?.role === "admin") return true;
  if (!user) return false;
  return { id: { equals: user.id } };
};

export const publicRead: Access = () => true;

export const publicReadAdminWrite = {
  read: publicRead,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};

export const publicReadEditorWrite = {
  read: publicRead,
  create: isEditor,
  update: isEditor,
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

export const publishedOrEditor: Access = ({ req: { user } }) => {
  if (user?.role === "admin" || user?.role === "moderator") return true;
  return { status: { equals: "published" } };
};

export const adminOnly: FieldAccess = ({ req: { user } }) =>
  user?.role === "admin";
