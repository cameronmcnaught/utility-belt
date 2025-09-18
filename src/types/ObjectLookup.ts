export type ValueOf<T extends Readonly<Record<string, unknown>>> = T[keyof T];

/**
 * Get the entire shape as is except the provided keys will be marked optional
 * @example
 * type Foo = { a: number; b: string; c?: object };
 * type Bar = AllBut<Foo, 'a'>; // { a?: number; b: string; c?: object }
 */
export type AllBut<T extends object, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Get the entire shape as optional except the provided keys will be left as is
 * @example
 * type Foo = { a: number; b: string; c?: object };
 * type Bar = NoneBut<Foo, 'a'>; // { a: number; b?: string; c?: object }
 */
export type NoneBut<T extends object, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;
