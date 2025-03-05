export class Inventory {
  private inventoryMap: Map<string, boolean>;

  constructor() {
    this.inventoryMap = new Map<string, boolean>();
  }

  has(key: string): boolean {
    return this.inventoryMap.has(key);
  }

  add(key: string): void {
    if (!key) {
      console.warn("WARNING! Trying to add falsy key to Inventory", key);
      return;
    }
    this.inventoryMap.set(key, true);
    // console.log(`將 ${key} 放進 Inventory `, this.inventoryMap);
  }

  clear(): void {
    this.inventoryMap = new Map<string, boolean>();
  }
}
