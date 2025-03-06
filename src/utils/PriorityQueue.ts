export default class PriorityQueue<T> {
    private _heap: T[];
    private _comparator: (a: T, b: T) => number;
  
    constructor(
      comparator: (a: T, b: T) => number = (a, b) =>
        a > b ? 1 : a < b ? -1 : 0
    ) {
      this._heap = [];
      this._comparator = comparator;
    }
  
    size(): number {
      return this._heap.length;
    }
  
    isEmpty(): boolean {
      return this.size() === 0;
    }
  
    peek(): T | undefined {
      return this._heap[0];
    }
  
    push(...values: T[]): number {
      for (const value of values) {
        this._heap.push(value);
        this._siftUp();
      }
      return this.size();
    }
  
    pop(): T | undefined {
      const poppedValue = this.peek();
      const bottom = this.size() - 1;
      if (bottom > 0) {
        this._swap(0, bottom);
      }
      this._heap.pop();
      this._siftDown();
      return poppedValue;
    }
  
    private _greater(i: number, j: number): boolean {
      return this._comparator(this._heap[i], this._heap[j]) < 0;
    }
  
    private _swap(i: number, j: number): void {
      [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
  
    private _siftUp(): void {
      let node = this.size() - 1;
      while (node > 0 && this._greater(node, Math.floor((node - 1) / 2))) {
        this._swap(node, Math.floor((node - 1) / 2));
        node = Math.floor((node - 1) / 2);
      }
    }
  
    private _siftDown(): void {
      let node = 0;
      while (
        (node * 2 + 1 < this.size() && this._greater(node * 2 + 1, node)) ||
        (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node))
      ) {
        const maxChild =
          node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node * 2 + 1)
            ? node * 2 + 2
            : node * 2 + 1;
        this._swap(node, maxChild);
        node = maxChild;
      }
    }
  }
  