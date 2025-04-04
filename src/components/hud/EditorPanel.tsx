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
  LEVEL_THEMES,
  SELECTED_CATEGORY_MAP,
  THEME_TILES_MAP,
} from "@/helpers/consts";
import { TILES } from "@/helpers/tiles";
import { removeTrailingDigit } from "@/utils/removeTrailingDigit";
import {
  splitAtFirstUnderscore,
  splitAtSecondUnderscore,
} from "@/utils/splitAtFirstUnderscore";
import { Slider } from "../ui/slider";
import { FrameCoord, LevelStateSnapshot } from "@/types/global";
import { useRecoilState } from "recoil";
import { selectedPlacementTypeAtom } from "@/atoms/selectedPlacementType";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { convertGameMapToTileMap } from "@/helpers/convertGameMapToTileMap ";

type EditorPanelProps = {
  level: LevelStateSnapshot;
};

function EditorPanel({ level }: EditorPanelProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("basics");
  const [selectedTile, setSelectedTile] = useState<FrameCoord>(
    THEME_TILES_MAP[LEVEL_THEMES.YELLOW]["WALL"]
  );
  const [placementType, setPlacementType] = useRecoilState(
    selectedPlacementTypeAtom
  );

  const handleZoomChange = (values: number[]) => {
    level.setZoom(values[0]);
  };

  const handleSelectedTile = (tile: FrameCoord) => {
    setSelectedTile(tile as FrameCoord);
    const tileName = Object.keys(TILES).find(
      (key) => TILES[key as keyof typeof TILES] === tile
    ) as string;

    const HAS_CORNER =
      tileName === "ICE_BOTTOM_LEFT" ||
      tileName === "ICE_BOTTOM_RIGHT" ||
      tileName === "ICE_TOP_LEFT" ||
      tileName === "ICE_TOP_RIGHT";
    const HAS_DIRECTION =
      tileName === "CONVEYOR_UP" ||
      tileName === "CONVEYOR_DOWN" ||
      tileName === "CONVEYOR_LEFT" ||
      tileName === "CONVEYOR_RIGHT";
    const IS_SWITCHDOOR =
      tileName === "SWITCH_DOOR_OUTLINE" || tileName === "SWITCH_DOOR_SOLID";
    const isLock = tileName === "BLUE_LOCK" || tileName === "GREEN_LOCK";
    const isKey = tileName === "BLUE_KEY" || tileName === "GREEN_KEY";
    // removeTrailingDigit() -> "WATER1" -> "WATER"
    if (HAS_CORNER) {
      const [type, corner] = splitAtFirstUnderscore(tileName);
      level.setEditModePlacement({ type, corner });
    } else if (HAS_DIRECTION) {
      const [type, direction] = splitAtFirstUnderscore(tileName);
      level.setEditModePlacement({ type, direction });
    } else if (IS_SWITCHDOOR) {
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
    setPlacementType(removeTrailingDigit(tileName));
  };

  const clearSelectedObject = () => {
    // 還原成預設選取物件(WALL) 方便使用者刪除物件
    setSelectedTile(THEME_TILES_MAP[LEVEL_THEMES.YELLOW]["WALL"]);
    handleSelectedTile(THEME_TILES_MAP[LEVEL_THEMES.YELLOW]["WALL"]);
    toast({
      title: "已還原成預設物件 (WALL)",
      description: "可以在關卡內點選並刪除物件",
    });
    level.solutionPath = []
  };

  return (
    <main className="flex flex-col p-2 h-screen overflow-scroll gap-2">
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
          onValueChange={handleZoomChange}
        />
        {/* Selected object */}
        <Label htmlFor="selectedObject">SELECTED OBJECT</Label>
        <section className="flex gap-3 items-center">
          <div className="relative w-[calc(16px*3)] h-[calc(16px*3)]">
            <div className="origin-top-left transform scale-[3]">
              <Sprite
                level={level}
                frameCoord={selectedTile}
                isColored={false}
                index={[]}
              />
            </div>
          </div>
          <Button className="flex-1" onClick={clearSelectedObject}>
            Clear Selected Object
          </Button>
        </section>

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
                tile === selectedTile ? "p-1 bg-yellow-400" : "opacity-50"
              } `}
              onClick={() => handleSelectedTile(tile as FrameCoord)}
            >
              <div className="relative w-[calc(16px*3)] h-[calc(16px*3)]">
                <div className="origin-top-left transform scale-[3]">
                  <Sprite
                    level={level}
                    frameCoord={tile}
                    isColored={false}
                    index={[]}
                  />
                </div>
              </div>
            </Button>
          ))}
        </div>
      </section>
      <Separator />
      <section className="flex flex-col gap-3">
        {/* solution path button */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              const solutionPath = level.updateSolutionPath();
              if (solutionPath?.length === 0) {
                toast({
                  title: "沒有路徑",
                  description: "檢查關卡是否無法通關",
                });
              }
            }}
          >
            Solution Path
          </Button>
          <Button
            variant={level.solutionPath?.length === 0 ? "ghost" : "secondary"}
            className="w-full"
            // disabled={level.solutionPath?.length === 0}
            onClick={() => {
              if (level.solutionPath?.length === 0) {
                toast({
                  title: "TODO: 無法啟動自動模式",
                  description: "沒有路徑產生",
                });
              }
            }}
          >
            Auto Move
          </Button>
        </div>
        <Separator />
        <div className="flex gap-1">
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
            onClick={() => {
              level.clearPlacements();
            }}
          >
            Clear Map
          </Button>
        </div>

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
        <Separator />
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            level.copyPlacementsToClipboard();
            toast({
              title: "複製 Placements 成功",
              description: "按下 F12 可以查看輸出結果",
            });
          }}
        >
          Export & copy JSON
        </Button>
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            const { success, message } = level.copyGameMapToClipboard();
            if (success) {
              toast({
                title: "複製 GAME MAP 成功",
                description: message,
              });
            } else {
              toast({
                title: "複製 GAME MAP 失敗",
                description: message,
              });
            }
          }}
        >
          Export & copy GameMap
        </Button>
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            console.log(convertGameMapToTileMap(level.gameMap));
          }}
        >
          Export & copy TileMap
        </Button>
      </section>
    </main>
  );
}

export default EditorPanel;
