/**
 * /api/import-exhibition — Bulk import museum rooms/panels/blocks from ZIP
 * Ported from: supabase/functions/import-exhibition/index.ts (346 lines)
 * Expects multipart form: { file: ZIP, museum_id: string, room_id?: string }
 * ZIP must contain manifest.json + image files
 */
import type { PayloadHandler } from "payload";
import JSZip from "jszip";

interface ImportBlock {
  type: "text" | "image" | "video" | "audio" | "quote" | "gallery";
  content?: string;
  title?: string;
  caption?: string;
  url?: string;
  image?: string;
  images?: string[];
  attribution?: string;
  speaker?: string;
}

interface ImportPanel {
  title: string;
  panel_number?: string;
  blocks: ImportBlock[];
}

interface ImportRoom {
  name: string;
  introduction?: string;
  cover_image?: string;
  panels: ImportPanel[];
}

interface ImportManifest {
  version?: string;
  museum_id?: string;
  rooms: ImportRoom[];
}

export const importExhibition: PayloadHandler = async (req) => {
  try {
    // Auth check — admin only
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    // Parse multipart form
    const contentType = req.headers?.get?.("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const reqData = (req as any);
    const museumId = (reqData.body?.museum_id || reqData.query?.museum_id) as string;
    const roomId = (reqData.body?.room_id || reqData.query?.room_id) as string | null;
    const zipBuffer = reqData.file?.buffer || reqData.body?.file;

    if (!zipBuffer || !museumId) {
      return Response.json({ error: "file and museum_id are required" }, { status: 400 });
    }

    // Parse ZIP
    const zip = await JSZip.loadAsync(zipBuffer);
    const manifestFile = zip.file("manifest.json");
    if (!manifestFile) {
      return Response.json({ error: "manifest.json not found in ZIP" }, { status: 400 });
    }

    const manifest: ImportManifest = JSON.parse(await manifestFile.async("text"));
    if (!manifest.rooms?.length) {
      return Response.json({ error: "Invalid manifest: rooms array required" }, { status: 400 });
    }

    const results = {
      roomsCreated: 0,
      panelsCreated: 0,
      blocksCreated: 0,
      imagesUploaded: 0,
      errors: [] as string[],
    };

    // ── Process rooms ────────────────────────────────────
    for (const room of manifest.rooms) {
      try {
        let targetRoomId = roomId;

        if (!targetRoomId) {
          // Find next room order
          const existingRooms = await req.payload.find({
            collection: "museum-rooms",
            where: { museum: { equals: museumId } },
            sort: "-roomOrder",
            limit: 1,
          });
          const nextOrder = (existingRooms.docs[0]?.roomOrder ?? 0) + 1;

          // Upload cover image
          let coverImageId: string | undefined;
          if (room.cover_image) {
            const imgFile = zip.file(room.cover_image);
            if (imgFile) {
              try {
                const imgData = await imgFile.async("nodebuffer");
                const ext = room.cover_image.split(".").pop() || "jpg";
                const uploaded = await req.payload.create({
                  collection: "media",
                  data: { alt: `${room.name} cover` },
                  file: {
                    data: imgData,
                    name: `room-cover-${Date.now()}.${ext}`,
                    mimetype: `image/${ext === "jpg" ? "jpeg" : ext}`,
                    size: imgData.length,
                  },
                });
                coverImageId = String(uploaded.id);
                results.imagesUploaded++;
              } catch (e: any) {
                results.errors.push(`Cover image upload failed: ${e.message}`);
              }
            }
          }

          const newRoom = await req.payload.create({
            collection: "museum-rooms",
            data: {
              museum: museumId,
              name: room.name,
              introduction: room.introduction || "",
              coverImage: coverImageId,
              roomOrder: nextOrder,
            },
          });
          targetRoomId = String(newRoom.id);
          results.roomsCreated++;
        }

        // ── Process panels ─────────────────────────────────
        const existingPanels = await req.payload.find({
          collection: "museum-panels",
          where: { room: { equals: targetRoomId } },
          sort: "-panelOrder",
          limit: 1,
        });
        let panelOrder = existingPanels.docs[0]?.panelOrder ?? 0;

        for (const panel of room.panels) {
          panelOrder++;

          // Build blocks array (embedded in panel)
          const blocks: Array<{ blockType: string; blockOrder: number; content: any }> = [];
          let blockOrder = 0;

          for (const block of panel.blocks) {
            blockOrder++;
            const content: Record<string, any> = {};

            switch (block.type) {
              case "text":
                content.text = block.content || "";
                if (block.title) content.title = block.title;
                break;

              case "image":
                if (block.image) {
                  const imgFile = zip.file(block.image);
                  if (imgFile) {
                    try {
                      const imgData = await imgFile.async("nodebuffer");
                      const ext = block.image.split(".").pop() || "jpg";
                      const uploaded = await req.payload.create({
                        collection: "media",
                        data: { alt: block.caption || "Panel image" },
                        file: {
                          data: imgData,
                          name: `panel-${Date.now()}-${blockOrder}.${ext}`,
                          mimetype: `image/${ext === "jpg" ? "jpeg" : ext}`,
                          size: imgData.length,
                        },
                      });
                      content.url = uploaded.url;
                      content.mediaId = uploaded.id;
                      results.imagesUploaded++;
                    } catch (e: any) {
                      results.errors.push(`Image upload failed: ${e.message}`);
                    }
                  }
                } else if (block.url) {
                  content.url = block.url;
                }
                if (block.caption) content.caption = block.caption;
                break;

              case "gallery":
                content.images = [];
                for (const imgName of block.images || []) {
                  const imgFile = zip.file(imgName);
                  if (imgFile) {
                    try {
                      const imgData = await imgFile.async("nodebuffer");
                      const ext = imgName.split(".").pop() || "jpg";
                      const uploaded = await req.payload.create({
                        collection: "media",
                        data: { alt: "Gallery image" },
                        file: {
                          data: imgData,
                          name: `gallery-${Date.now()}-${content.images.length}.${ext}`,
                          mimetype: `image/${ext === "jpg" ? "jpeg" : ext}`,
                          size: imgData.length,
                        },
                      });
                      content.images.push(uploaded.url);
                      results.imagesUploaded++;
                    } catch {}
                  }
                }
                if (block.caption) content.caption = block.caption;
                break;

              case "video":
              case "audio":
                content.url = block.url || "";
                if (block.title) content.title = block.title;
                break;

              case "quote":
                content.text = block.content || "";
                if (block.attribution) content.attribution = block.attribution;
                if (block.speaker) content.speaker = block.speaker;
                break;
            }

            blocks.push({ blockType: block.type, blockOrder, content });
          }

          await req.payload.create({
            collection: "museum-panels",
            data: {
              room: targetRoomId,
              title: panel.title,
              panelNumber: panel.panel_number || "",
              panelOrder,
              blocks,
            },
          });
          results.panelsCreated++;
          results.blocksCreated += blocks.length;
        }
      } catch (roomErr: any) {
        results.errors.push(`Room "${room.name}" error: ${roomErr.message}`);
      }
    }

    return Response.json(results);
  } catch (err: any) {
    req.payload.logger?.error?.(`import-exhibition error: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }
};
