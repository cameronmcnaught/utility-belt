/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 *
 * More intended to help debug types to understand the actual resolved type.
 * @see https://youtu.be/lraHlXpuhKs?si=1udwviVfi1ZmRSxU&t=420
 * @example
 * // type Test = AllBut<{ a: number; b: string; c?: object }, 'a'>;
 * type Test = Omit<{
 *  a: number;
 *  b: string;
 *  c?: object;
 * }, "a"> & Partial<Pick<{
 *  a: number;
 *  b: string;
 *  c?: object;
 * }, "a">>
 *
 * // type Test = Prettify<AllBut<{ a: number; b: string; c?: object }, 'a'>>;
 * type Test = {
 *  b: string;
 *  c?: object | undefined;
 *  a?: number | undefined;
 * }
 */
export type Prettify<T extends object> = {
  [K in keyof T]: T[K];
} & {};
