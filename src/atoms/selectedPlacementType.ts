import { PLACEMENT_TYPE_WALL } from "@/helpers/consts";
import { atom } from "recoil";

export const selectedPlacementTypeAtom = atom({
  key: "selectedPlacementType",
  default: PLACEMENT_TYPE_WALL,
});
