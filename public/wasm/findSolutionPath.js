async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(
            `${message} in ${fileName}:${lineNumber}:${columnNumber}`
          );
        })();
      },
      "console.log"(text) {
        // ~lib/bindings/dom/console.log(~lib/string/String) => void
        text = __liftString(text >>> 0);
        console.log(text);
      },
      "console.error"(text) {
        // ~lib/bindings/dom/console.error(~lib/string/String) => void
        text = __liftString(text >>> 0);
        console.error(text);
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf(
    {
      buildFlourMapping(placements) {
        // assembly/index/buildFlourMapping(~lib/array/Array<assembly/types/global/ExtendedPlacementConfig>) => assembly/types/global/FlourMapResult
        placements =
          __lowerArray(
            (pointer, value) => {
              __setU32(pointer, __lowerRecord19(value) || __notnull());
            },
            20,
            2,
            placements
          ) || __notnull();
        return __liftInternref(exports.buildFlourMapping(placements) >>> 0);
      },
      findSolutionPath(gameMap, width, height, placements) {
        // assembly/index/findSolutionPath(~lib/array/Array<~lib/array/Array<~lib/string/String>>, i32, i32, ~lib/array/Array<assembly/types/global/ExtendedPlacementConfig>) => ~lib/array/Array<~lib/staticarray/StaticArray<i32>>
        gameMap = __retain(
          __lowerArray(
            (pointer, value) => {
              __setU32(
                pointer,
                __lowerArray(
                  (pointer, value) => {
                    __setU32(pointer, __lowerString(value) || __notnull());
                  },
                  10,
                  2,
                  value
                ) || __notnull()
              );
            },
            25,
            2,
            gameMap
          ) || __notnull()
        );
        placements =
          __lowerArray(
            (pointer, value) => {
              __setU32(pointer, __lowerRecord19(value) || __notnull());
            },
            20,
            2,
            placements
          ) || __notnull();
        try {
          return __liftArray(
            (pointer) => __liftStaticArray(__getI32, 2, __getU32(pointer)),
            2,
            exports.findSolutionPath(gameMap, width, height, placements) >>> 0
          );
        } finally {
          __release(gameMap);
        }
      },
      heuristicOptimized(cx, cy, flourMap, goalPosition) {
        // assembly/index/heuristicOptimized(i32, i32, ~lib/map/Map<~lib/string/String,i32>, assembly/types/global/ExtendedPlacementConfig) => i32
        flourMap = __retain(__lowerInternref(flourMap) || __notnull());
        goalPosition = __lowerRecord19(goalPosition) || __notnull();
        try {
          return exports.heuristicOptimized(cx, cy, flourMap, goalPosition);
        } finally {
          __release(flourMap);
        }
      },
      findSolutionPathSimple(encodedMap, width, height, encodedPlacements) {
        // assembly/index/findSolutionPathSimple(~lib/string/String, i32, i32, ~lib/string/String) => ~lib/array/Array<~lib/staticarray/StaticArray<i32>>
        encodedMap = __retain(__lowerString(encodedMap) || __notnull());
        encodedPlacements = __lowerString(encodedPlacements) || __notnull();
        try {
          return __liftArray(
            (pointer) => __liftStaticArray(__getI32, 2, __getU32(pointer)),
            2,
            exports.findSolutionPathSimple(
              encodedMap,
              width,
              height,
              encodedPlacements
            ) >>> 0
          );
        } finally {
          __release(encodedMap);
        }
      },
    },
    exports
  );
  function __lowerRecord19(value) {
    // assembly/types/global/ExtendedPlacementConfig
    // Hint: Opt-out from lowering as a record by providing an empty constructor
    if (value == null) return 0;
    const pointer = exports.__pin(exports.__new(40, 19));
    __setU32(pointer + 0, value.x);
    __setU32(pointer + 4, value.y);
    __setU32(pointer + 8, __lowerString(value.type) || __notnull());
    __setU32(pointer + 12, __lowerString(value.direction));
    __setU8(pointer + 16, value.isRaised ? 1 : 0);
    __setU32(pointer + 20, __lowerString(value.color));
    __setU32(pointer + 24, __lowerString(value.corner));
    __setU32(pointer + 28, __lowerString(value.initialDirection));
    __setU32(pointer + 32, __lowerString(value.id));
    __setU32(pointer + 36, __lowerString(value.frameCoord));
    exports.__unpin(pointer);
    return pointer;
  }
  function __liftString(pointer) {
    if (!pointer) return null;
    const end =
        (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let start = pointer >>> 1,
      string = "";
    while (end - start > 1024)
      string += String.fromCharCode(
        ...memoryU16.subarray(start, (start += 1024))
      );
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i)
      memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __liftArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const dataStart = __getU32(pointer + 4),
      length = __dataview.getUint32(pointer + 12, true),
      values = new Array(length);
    for (let i = 0; i < length; ++i)
      values[i] = liftElement(dataStart + ((i << align) >>> 0));
    return values;
  }
  function __lowerArray(lowerElement, id, align, values) {
    if (values == null) return 0;
    const length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__pin(exports.__new(16, id)) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    __dataview.setUint32(header + 12, length, true);
    for (let i = 0; i < length; ++i)
      lowerElement(buffer + ((i << align) >>> 0), values[i]);
    exports.__unpin(buffer);
    exports.__unpin(header);
    return header;
  }
  function __liftStaticArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const length = __getU32(pointer - 4) >>> align,
      values = new Array(length);
    for (let i = 0; i < length; ++i)
      values[i] = liftElement(pointer + ((i << align) >>> 0));
    return values;
  }
  class Internref extends Number {}
  const registry = new FinalizationRegistry(__release);
  function __liftInternref(pointer) {
    if (!pointer) return null;
    const sentinel = new Internref(__retain(pointer));
    registry.register(sentinel, pointer);
    return sentinel;
  }
  function __lowerInternref(value) {
    if (value == null) return 0;
    if (value instanceof Internref) return value.valueOf();
    throw TypeError("internref expected");
  }
  const refcounts = new Map();
  function __retain(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount) refcounts.set(pointer, refcount + 1);
      else refcounts.set(exports.__pin(pointer), 1);
    }
    return pointer;
  }
  function __release(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount === 1) exports.__unpin(pointer), refcounts.delete(pointer);
      else if (refcount) refcounts.set(pointer, refcount - 1);
      else
        throw Error(
          `invalid refcount '${refcount}' for reference '${pointer}'`
        );
    }
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU8(pointer, value) {
    try {
      __dataview.setUint8(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint8(pointer, value, true);
    }
  }
  function __setU32(pointer, value) {
    try {
      __dataview.setUint32(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint32(pointer, value, true);
    }
  }
  function __getI32(pointer) {
    try {
      return __dataview.getInt32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getInt32(pointer, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
export const {
  memory,
  buildFlourMapping,
  findSolutionPath,
  heuristicOptimized,
  findSolutionPathSimple,
} = await (async (url) =>
  instantiate(
    await (async () => {
      // const isNodeOrBun = typeof process != "undefined" && process.versions != null && (process.versions.node != null || process.versions.bun != null);
      // if (isNodeOrBun) { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
      // else { }
      return await globalThis.WebAssembly.compileStreaming(
        globalThis.fetch(url)
      );
    })(),
    {}
  ))(new URL("findSolutionPath.wasm", import.meta.url));
