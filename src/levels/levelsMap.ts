import generateMap from "@/utils/generateMap";
import DemoLevel1 from "./DemoLevel1";
import DemoLevel2 from "./DemoLevel2";
import DemoLevel5 from "./DemoLevel5";
import { BugLevel3 } from "./BugLevel3";
import { gm } from "@/utils/gm";

const levels = {
  DemoLevel1: gm(), //DemoLevel1,
  DemoLevel2: DemoLevel2,
};

export default levels;
