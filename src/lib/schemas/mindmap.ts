import { z } from "zod";

export const mindMapCreateSchema = z.object({
  title: z.string().max(200).optional(),
  noteId: z.string().optional(),
  theme: z.enum(["default", "dark", "colorful", "minimal"]).optional(),
  layoutType: z.enum(["radial", "tree", "horizontal", "vertical"]).optional(),
  description: z.string().optional(),
});

export const mindMapUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  viewport: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    })
    .optional(),
  theme: z.enum(["default", "dark", "colorful", "minimal"]).optional(),
  layoutType: z.enum(["radial", "tree", "horizontal", "vertical"]).optional(),
  isShareable: z.boolean().optional(),
});

export const mindMapNodeInputSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().nullable().optional(),
  label: z.string().min(1),
  description: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  textColor: z.string().optional(),
  fontSize: z.number().optional(),
  shape: z.enum(["rounded", "rectangle", "ellipse", "diamond"]).optional(),
  sortOrder: z.number().optional(),
});

export const mindMapNodeUpdateSchema = mindMapNodeInputSchema.partial().extend({
  isCollapsed: z.boolean().optional(),
});

export const mindMapEdgeInputSchema = z.object({
  id: z.string().optional(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["smoothstep", "straight", "bezier"]).optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  animated: z.boolean().optional(),
  label: z.string().optional(),
});

export const mindMapBulkUpdateSchema = z.object({
  nodes: z
    .object({
      create: z.array(mindMapNodeInputSchema).optional(),
      update: z
        .array(
          z.object({
            id: z.string(),
            data: mindMapNodeUpdateSchema,
          })
        )
        .optional(),
      delete: z.array(z.string()).optional(),
    })
    .optional(),
  edges: z
    .object({
      create: z.array(mindMapEdgeInputSchema).optional(),
      delete: z.array(z.string()).optional(),
    })
    .optional(),
  viewport: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    })
    .optional(),
});
