export const splitAtFirstUnderscore = (s: string): string[] => {
  const idx = s.indexOf("_");
  if (idx === -1) {
    // 沒有底線的話，回傳原字串及空字串
    return [s, ""];
  }
  return [s.slice(0, idx), s.slice(idx + 1)];
};

export const splitAtSecondUnderscore = (s: string): string[] => {
  const firstIndex = s.indexOf("_");
  if (firstIndex === -1) {
    // 若沒有底線，回傳原字串及空字串
    return [s, ""];
  }
  const secondIndex = s.indexOf("_", firstIndex + 1);
  if (secondIndex === -1) {
    // 若只有一個底線，也可依需求處理，這裡回傳原字串及空字串
    return [s, ""];
  }
  return [s.slice(0, secondIndex), s.slice(secondIndex + 1)];
};
