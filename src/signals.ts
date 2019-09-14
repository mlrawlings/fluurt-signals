import { currentFragment } from "./fragments";

let depTracker: Set<Signal<unknown>> | undefined;
let sid = 0;

type Setter<T> = Signal<T>["___set"];
export type MaybeSignal<T> = Signal<T> | T;
export type Raw<T> = T extends Signal<infer V> ? V : T;

export class Signal<T> {
  public sid: number = sid++;
  public ___value: T;
  private ___listeners: Set<ComputedSignal<unknown>> = new Set();
  constructor(current: T) {
    this.___value = current;
  }
  public ___set(nextValue: T) {
    if (nextValue !== this.___value || nextValue instanceof Object) {
      this.___value = nextValue;
      for (const l of this.___listeners) {
        l.___compute();
      }
    }
    return nextValue;
  }
  public ___on(listener: ComputedSignal<unknown>) {
    this.___listeners.add(listener);
  }
  public ___off(listener: ComputedSignal<unknown>) {
    this.___listeners.delete(listener);
  }
}

export class ComputedSignal<T> extends Signal<T> {
  public static create<T>(fn: (set: Setter<T>) => T) {
    const signal = new ComputedSignal(fn);

    if (!signal.___prevDeps.size) {
      if (currentFragment) {
        currentFragment.tracked.add(signal);
      }
      return signal.___value;
    } else {
      return signal;
    }
  }

  private ___fn: (set: Setter<T>) => T;
  private ___prevDeps: Set<Signal<unknown>>;
  private ___boundSet: Setter<T>;
  constructor(fn: (set: Setter<T>) => T) {
    super((undefined as any) as T);
    this.___fn = fn;
    this.___boundSet = this.___set.bind(this);
    this.___compute();
  }
  public ___compute() {
    const fn = this.___fn;
    const prevDeps = this.___prevDeps;
    const parentTracker = depTracker;
    const nextDeps = (depTracker = new Set());
    const nextValue = fn(this.___boundSet);
    depTracker = parentTracker;
    for (const d of nextDeps) {
      d.___on(this);
    }
    if (prevDeps) {
      for (const d of prevDeps) {
        if (!nextDeps.has(d)) {
          d.___off(this);
        }
      }
    }
    this.___prevDeps = nextDeps;
    return nextValue;
  }
  public ___cleanup() {
    for (const d of this.___prevDeps) {
      d.___off(this);
    }
  }
}

export const compute = ComputedSignal.create;

export function dynamicKeys(
  object: MaybeSignal<{ [x: string]: unknown }>,
  watchedKeys: string[]
) {
  if (object instanceof Signal) {
    watchedKeys.forEach(
      key => (object[key] = compute(setKey => setKey(get(get(object)[key]))))
    );
  }
  return object;
}

export function get<T>(value: MaybeSignal<T>): T {
  if (value instanceof Signal) {
    if (depTracker) {
      depTracker.add(value);
    }
    value = value.___value;
  }
  return value;
}

export function set(value: MaybeSignal<unknown>, newValue: unknown) {
  if (value instanceof Signal) {
    value.___set(newValue);
  }
  return newValue;
}
