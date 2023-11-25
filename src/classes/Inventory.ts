export class Inventory {
  constructor() {
    this.inventoryMap = new Map();
  }

  has(key) {
    return Boolean(this.inventoryMap.has(key));
  }

  add(key) {
    if (!key) {
      console.warn("WARNING! Trying to add falsy key to Inventory", key);
      return;
    }
    this.inventoryMap.set(key, true);
    console.log(`將 ${key} 放進 Inventory `, this.inventoryMap);
  }

  clear() {
    this.inventoryMap = new Map();
  }
}
