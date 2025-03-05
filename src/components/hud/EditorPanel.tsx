import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sprite from "@/components/object-graphics/Sprite";
import {
  PLACEMENT_TYPE_CONVEYOR,
  PLACEMENT_TYPE_FLYING_ENEMY,
  PLACEMENT_TYPE_GROUND_ENEMY,
  PLACEMENT_TYPE_ICE,
  SELECTED_CATEGORY_MAP,
} from "@/helpers/consts";
import { Level } from "@/helpers/types";
import { TILES } from "@/helpers/tiles";
import { removeTrailingDigit } from "@/utils/removeTrailingDigit";
import {
  splitAtFirstUnderscore,
  splitAtSecondUnderscore,
} from "@/utils/splitAtFirstUnderscore";
import { Slider } from "../ui/slider";
import { LevelStateSnapshot } from "@/types/global";

type EditorPanelProps = {
  level: LevelStateSnapshot;
};

function EditorPanel({ level }: EditorPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState("basics");
  const [selectedTile, setSelectedTile] = useState("");
  return (
    <main className="flex flex-col p-2 h-screen overflow-scroll">
      <section className="flex-1 flex flex-col gap-2">
        {/* Level title input */}
        {/* <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="levelTitle">LEVEL TITLE</Label>
          <Input id="levelTitle" placeholder="Level Title" />
        </div> */}
        {/* zoom slider */}
        <Label htmlFor="zoom">Zoom: {level.zoom}</Label>
        <Slider
          defaultValue={[0.54]}
          max={1}
          step={0.01}
          onValueChange={(values) => {
            level.setZoom(values[0]);
          }}
        />

        {/* object category select */}
        <Label htmlFor="objectCategory">OBJECT CATEGORY</Label>
        <Select onValueChange={(value) => setSelectedCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Basics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basics">Basics</SelectItem>
            <SelectItem value="tiles">Tiles</SelectItem>
            <SelectItem value="pickups">Pickups</SelectItem>
            <SelectItem value="enemies">Enemies</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-4">
          {SELECTED_CATEGORY_MAP[selectedCategory]?.map((tile, index) => (
            <Button
              variant="outline"
              value={tile}
              key={index}
              className={`w-fit h-fit p-1 ${
                tile === selectedTile && "p-1 bg-blue-700"
              } `}
              onClick={() => {
                setSelectedTile(tile);
                const tileName = Object.keys(TILES).find(
                  (key) => TILES[key as keyof typeof TILES] === tile
                ) as string;
                const hasCorner =
                  tileName === "ICE_BOTTOM_LEFT" ||
                  tileName === "ICE_BOTTOM_RIGHT" ||
                  tileName === "ICE_TOP_LEFT" ||
                  tileName === "ICE_TOP_RIGHT";
                const hasDirection =
                  tileName === "CONVEYOR_UP" ||
                  tileName === "CONVEYOR_DOWN" ||
                  tileName === "CONVEYOR_LEFT" ||
                  tileName === "CONVEYOR_RIGHT";
                const isSwitchDoor =
                  tileName === "SWITCH_DOOR_OUTLINE" ||
                  tileName === "SWITCH_DOOR_SOLID";
                const isLock =
                  tileName === "BLUE_LOCK" || tileName === "GREEN_LOCK";
                const isKey =
                  tileName === "BLUE_KEY" || tileName === "GREEN_KEY";
                // removeTrailingDigit() -> "WATER1" -> "WATER"
                if (hasCorner) {
                  const [type, corner] = splitAtFirstUnderscore(tileName);
                  level.setEditModePlacement({ type, corner });
                } else if (hasDirection) {
                  const [type, direction] = splitAtFirstUnderscore(tileName);
                  level.setEditModePlacement({ type, direction });
                } else if (isSwitchDoor) {
                  const [type, subStr] = splitAtSecondUnderscore(tileName);

                  level.setEditModePlacement({
                    type,
                    isRaised: subStr === "SOLID",
                  });
                } else if (isLock || isKey) {
                  const [color, type] = splitAtFirstUnderscore(tileName);
                  level.setEditModePlacement({ type, color });
                } else {
                  level.setEditModePlacement({
                    type: removeTrailingDigit(tileName),
                  });
                }
              }}
            >
              <div className="relative w-[calc(16px*3)] h-[calc(16px*3)]">
                <div className="origin-top-left transform scale-[3]">
                  <Sprite frameCoord={tile} />
                </div>
              </div>
            </Button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
         {/* solution path button */}
         <Button
          variant="default"
          className="w-full"
          onClick={() => {
            level.updateSolutionPath()
          }}
        >
          Solution Path
        </Button>
        {/* change theme button */}
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            level.changeTheme();
          }}
        >
          Change Theme
        </Button>
        {/* clear map button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            level.clearPlacements();
          }}
        >
          Clear Map
        </Button>
        {/* map width height editor */}
        <div className="flex justify-around items-center">
          <Button
            variant="default"
            onClick={() => {
              level.updateTilesWidth(-1);
            }}
          >
            -
          </Button>
          Width: {level.tilesWidth}
          <Button
            variant="default"
            onClick={() => {
              level.updateTilesWidth(1);
            }}
          >
            +
          </Button>
        </div>

        <div className="flex justify-around items-center">
          <Button
            variant="default"
            onClick={() => {
              level.updateTilesHeight(-1);
            }}
          >
            -
          </Button>
          Height: {level.tilesHeight}
          <Button
            variant="default"
            onClick={() => {
              level.updateTilesHeight(+1);
            }}
          >
            +
          </Button>
        </div>

        {/* export button */}
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            level.copyPlacementsToClipboard();
          }}
        >
          Export & copy
        </Button>
      </section>
    </main>
  );
}

export default EditorPanel;
