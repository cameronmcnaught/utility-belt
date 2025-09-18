import { expect, test, describe } from 'bun:test';
import { createStore } from './createStore';

describe('createStore', () => {
  test('Creates a store with initial state and generated setters and reset function', () => {
    const useConfig = createStore({
      isTutorial: false,
      count: 0,
      toggle() {},
    });

    expect(useConfig.getState()).toHaveProperty('isTutorial');
    expect(useConfig.getState()).toHaveProperty('count');
    expect(useConfig.getState()).toHaveProperty('setIsTutorial');
    expect(useConfig.getState()).toHaveProperty('setCount');
    expect(useConfig.getState()).toHaveProperty('toggle');
    expect(useConfig.getState()).not.toHaveProperty('setToggle');
    expect(useConfig.getState()).toHaveProperty('reset');
  });

  /**
   * The `readonly` modifier in TypeScript is a compile-time construct and does not
   * enforce immutability at runtime. Therefore, the setter function can still be
   * created and used to modify the property, even if TypeScript will prevent
   * direct assignment to it in code.
   */
  test('Creates a store with setters for readonly properties', () => {
    type Config = {
      readonly isTutorial: boolean;
      count: number;
    };

    const useConfig = createStore<Config>({
      isTutorial: false,
      count: 0,
    });

    expect(useConfig.getState()).toHaveProperty('isTutorial');
    expect(useConfig.getState()).toHaveProperty('count');
    expect(useConfig.getState()).toHaveProperty('setCount');
    expect(useConfig.getState()).toHaveProperty('reset');
    expect(useConfig.getState()).toHaveProperty('setIsTutorial');
  });

  test('Creates a store with generated setters that update the state', () => {
    const useConfig = createStore({
      isTutorial: false,
      count: 0,
    });

    expect(useConfig.getState().isTutorial).toBe(false);
    expect(useConfig.getState().count).toBe(0);

    useConfig.getState().setIsTutorial(true);
    useConfig.getState().setCount(5);

    expect(useConfig.getState().isTutorial).toBe(true);
    expect(useConfig.getState().count).toBe(5);
  });

  test('Creates a store with a reset function that resets the state', () => {
    const useConfig = createStore({
      isTutorial: false,
      count: 0,
    });

    useConfig.getState().setIsTutorial(true);
    useConfig.getState().setCount(5);

    useConfig.getState().reset();

    expect(useConfig.getState().isTutorial).toBe(false);
    expect(useConfig.getState().count).toBe(0);
  });

  test('Creates a store with a custom function when provided', () => {
    const useConfig = createStore(
      {
        isTutorial: false,
        count: 0,
      },
      () => ({
        doNothing: () => {},
      })
    );

    expect(useConfig.getState().doNothing).toBeDefined();
  });

  test('Creates a store with a custom function that can update a readonly property', () => {
    type Config = { readonly isTutorial: boolean; count: number };
    type Custom = { toggleTutorial: () => void };

    const useConfig = createStore<Config, Custom>(
      {
        isTutorial: false,
        count: 0,
      },
      (set, get) => ({
        toggleTutorial: () => {
          set({ isTutorial: !get().isTutorial });
        },
      })
    );

    expect(useConfig.getState().toggleTutorial).toBeDefined();

    expect(useConfig.getState().isTutorial).toBe(false);
    useConfig.getState().toggleTutorial();
    expect(useConfig.getState().isTutorial).toBe(true);
    useConfig.getState().toggleTutorial();
    expect(useConfig.getState().isTutorial).toBe(false);
  });
});
