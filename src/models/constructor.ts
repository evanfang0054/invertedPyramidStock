type Handler = (value: any) => void

type CollectionStack = {
  type: 'then';
  callback<I = any, O = I>(value: I): O | void;
} | {
  type: 'catch';
  callback<I = any, O = I>(value: I): O | void;
} | {
  type: 'cancel';
  callback<I = any, O = I>(value: I): O | void;
} | {
  type: 'finally';
  callback(): void;
}

export class Emitter<T extends string> {
  private map: Map<T, Set<Handler>> = new Map()
  public add(type: T, handler: Handler): void {
    if (!this.map.has(type)) {
      this.map.set(type, new Set())
    }
    (this.map.get(type) as Set<Handler>).add(handler)
  }
  public remove(type: T, handler: Handler): void {
    if (!this.map.has(type)) {
      return
    }
    (this.map.get(type) as Set<Handler>).delete(handler)
  }
  public emit(type: T, value: any) {
    if (this.map.has(type)) {
      (this.map.get(type) as Set<Handler>).forEach(f => f(value))
    }
  }
}

export type MaybeType<T extends any> = T | null | undefined

/**
 * 队列长度固定等于length，遵循左出右进原则
 * e.g.
 * new Queue([1], 3) -> [undefined, undefined, 1]
 * new Queue([1, 2, 3, 4]) -> [3, 4]
 */
export class Queue<T> {
  constructor(list: MaybeType<T>[], private length: number = 2) {
    this.value = [...new Array(length), ...list.slice(-length)].slice(-length)
  }

  public value: MaybeType<T>[]

  public add(...args: MaybeType<T>[]) {
    this.value = [...this.value, ...args.slice(-this.length)].slice(-this.length)
    return this.value
  }
}

export class PromiseLikeCollection {
  private queue: CollectionStack[] = []
  public then<T = any>(onFulfilled?: any): this {
    this.queue.push({
      type: 'then',
      callback: onFulfilled,
    })
    return this
  }
  public catch(onRejected?: any): this {
    this.queue.push({
      type: 'catch',
      callback: onRejected,
    })
    return this
  }
  public cancel(onCancel: any): void {
    this.queue.push({
      type: 'cancel',
      callback: onCancel,
    })
  }
  public finally(onFinal: any): void {
    this.queue.push({
      type: 'finally',
      callback: onFinal,
    })
  }
  public get(): CollectionStack[] {
    return [...this.queue]
  }
  public reset(): void {
    this.queue = []
  }
}