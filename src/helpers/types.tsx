import { z } from "zod";

const placementSchema = z.object({
  id: z.number().optional(),
  x: z.number(),
  y: z.number(),
  type: z.string().optional(),
  frameCoord: z
    .string()
    .includes("x", { message: "'x' is required, eg. 0x1, 6x4" })
    .optional(),
  // renderComponent: z.function<ReactElement>({}).nullable(),
});

const levelSchema = z.object({
  theme: z.string(),
  tilesWidth: z.number(),
  tilesHeight: z.number(),
  placements: z.array(placementSchema),
  isPositionOutOfBounds:  z.function().args(z.number(), z.number()).returns(z.boolean())
});

export type PlacementSchema = z.infer<typeof placementSchema>;
export type LevelSchema = z.infer<typeof levelSchema>;
