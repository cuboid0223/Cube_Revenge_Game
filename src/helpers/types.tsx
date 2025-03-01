import { z } from "zod";


const frameCoordSchema = z
.string()
.includes("x", { message: "'x' is required, eg. 0x1, 6x4" })
.optional()

const placementSchema = z.object({
  id: z.number().optional(),
  x: z.number(),
  y: z.number(),
  type: z.string(),
  frameCoord: frameCoordSchema,
  // renderComponent: z.function<ReactElement>({}).nullable(),
});



const levelSchema = z.object({
  theme: z.string(),
  tilesWidth: z.number(),
  tilesHeight: z.number(),
  placements: z.array(placementSchema),
  isPositionOutOfBounds:  z.function().args(z.number(), z.number()).returns(z.boolean())
});

export type Placement = z.infer<typeof placementSchema>;
export type Level = z.infer<typeof levelSchema>;
export type FrameCoord = z.infer<typeof frameCoordSchema>;