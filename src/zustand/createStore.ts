import { create, type StateCreator } from 'zustand';

type Reset = { reset: () => void };

export type FullState<T> = T & Setters<T> & Reset;

// From https://github.com/sindresorhus/type-fest/blob/main/source/is-equal.d.ts
type IsEqual<A, B> = (<G>() => G extends (A & G) | G ? 1 : 2) extends <
  G
>() => G extends (B & G) | G ? 1 : 2
  ? true
  : false;

type IsReadonlyKey<T, K extends keyof T> = IsEqual<
  { [Key in K]: T[Key] },
  { readonly [Key in K]: T[Key] }
>;

type WritableKeys<T> = {
  [K in keyof T]: IsReadonlyKey<T, K> extends true ? never : K;
}[keyof T];

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

/**
 * Get the setters for all writable keys in the given shape.
 * Any keys marked as readonly will be ignored.
 *
 * @example
 * type Person = {
 *   fname: string;
 *   lname: string;
 *   readonly age: number;
 * }
 * type PersonSetters = Setters<Person>;
 * // { setFname: (v: string) => void; setLname: (v: string) => void; }
 */
type Setters<T> = {
  [K in Exclude<WritableKeys<T>, FunctionKeys<T>> as `set${Capitalize<
    string & K
  >}`]: (v: T[K]) => void;
};

/// Utility functions to implement the above types

/**
 * Creates a zustand slice that contains only the data from the initial state.
 *
 * @param initialState Initial state to create the slice from.
 */
const createDataSlice =
  <S, D>(initialState: D): StateCreator<S, [], [], D> =>
  () => ({ ...initialState });

const stripFunctions = <T>(obj: T) => {
  const result = {} as T;
  for (const key in obj) {
    if (typeof obj[key] !== 'function') {
      result[key] = obj[key];
    }
  }
  return result as Omit<T, FunctionKeys<T>>;
};

/**
 * Creates a zustand slice that contains only the setter functions for the initial state.
 *
 * @param initialState Initial state to create the slice from.
 */
const createSettersSlice =
  <S, D>(initialState: D): StateCreator<S, [], [], Setters<D>> =>
  (set) => {
    const result = {} as Setters<D>;
    for (const key in stripFunctions(initialState)) {
      const setterKey = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
      // @ts-expect-error - Dynamic key
      result[setterKey] = (value: (typeof initialState)[typeof key]) =>
        set({ [key]: value } as unknown as Partial<S>);
    }
    return result;
  };

/**
 * Creates a zustand store containing:
 * - The data from the given initial state
 * - Setter functions for each writable key in the initial state
 * - A reset function to reset the state back to the initial state
 * - Any additional custom state or functions provided by the optional creator parameter
 *
 * @param initialState Initial state to create the store from.
 * @param creator (optional) Additional custom state or functions to add to the store.
 * @returns The complete Zustand store hook with data, setters, reset, and any custom additions.
 *
 * @example
 * // Create the store with initial state and custom actions
 * const useConfig1 = createState({
 *   isTutorial: false,
 * });
 * // useConfig1.isTutorial(); // boolean
 * // useConfig1.setIsTutorial(); // (v: boolean) => void
 * // useConfig1.reset(); // () => void
 *
 * // -----
 *
 * // Additionally you can add custom actions on top of the generated ones. The type of
 * // this can be inferred, however if you need to explicitly type the initial state,
 * // then you'll also need to explicitly type the custom state/actions.
 *
 * // Inferred
 * const useConfig2 = createState(
 *  { isTutorial: false },
 *  (set) => ({
 *    toggle: (v: boolean) => set({ isTutorial: v })
 *  })
 * );
 * // useConfig2.toggle(true);
 *
 * // Explicitly typed
 * type Config = { isTutorial: boolean };
 * type Custom = { toggle: (v: boolean) => void };
 * const useConfig3 = createState<Config, Custom>(
 *  { isTutorial: false },
 *  (set) => ({
 *    toggle: (v: boolean) => set({ isTutorial: v })
 *  })
 * );
 * // useConfig3.toggle(true);
 *
 * // -----
 *
 * // Another use case could be to have a readonly key in the initial state, which will not have a
 * // setter generated for it. But you can still add custom actions to modify it if needed. In a
 * // way this is similar to a protected key in classes.
 *
 * type Config = { readonly isTutorial: boolean };
 * type Custom = { toggle: (v: boolean) => void };
 * const useConfig4 = createState<Config, Custom>(
 *  { isTutorial: false },
 *  (set) => ({
 *    toggle: (v: boolean) => set({ isTutorial: v })
 *  })
 * );
 * // useConfig4.isTutorial(); // boolean
 * // useConfig4.setIsTutorial(); // Error: Property 'setIsTutorial' does not exist
 * // useConfig4.toggle(true); // Works fine
 */
export const createStore = <D, C = unknown>(
  initialState: D,
  creator?: StateCreator<FullState<D> & C, [], [], C>
) =>
  create<FullState<D> & C>()(
    (...args) =>
      ({
        ...createDataSlice<FullState<D> & C, D>(initialState)(...args),
        ...createSettersSlice<FullState<D> & C, D>(initialState)(...args),
        reset: () =>
          args[0]({ ...(initialState as Parameters<(typeof args)[0]>[0]) }),
        ...creator?.(...args),
      } as FullState<D> & C)
  );
