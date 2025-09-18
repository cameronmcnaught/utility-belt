import { describe, expect, test } from 'bun:test';
import {
  withSelector,
  type Selector,
  type SelectorCreator,
} from './withSelector';

describe('withSelector', () => {
  test('Returns the full data when no selector is provided', () => {
    const data = { a: 1, b: 'two', c: true };
    const result = withSelector(data);
    expect(result).toEqual({ ...data, select: expect.any(Function) });
  });

  test('Returns the selected data when a selector is provided', () => {
    const data = { a: 1, b: 'two', c: true };
    const result = withSelector(data).select((d) => d?.b);
    expect(result).toBe('two');
  });

  test('Handles selectors that return multiple properties', () => {
    const data = { a: 1, b: 'two', c: true };
    const result = withSelector(data).select((d) => ({ a: d?.a, c: d?.c }));
    expect(result).toEqual({ a: 1, c: true });
  });

  test('Able to pass in a custom selector', () => {
    const data = { a: 1, b: 'two', c: true };

    const selector: Selector<typeof data, number> = (d) => d?.a;

    const result = withSelector(data).select(selector);
    expect(result).toEqual(1);
  });

  test('Able to pass in a custom selector using the creator', () => {
    const data = { a: 1, b: 'two', c: true };

    const selectBuffer: SelectorCreator<typeof data, number> =
      (buffer: number) => (d) =>
        (d?.a ?? 0) + buffer;

    const result = withSelector(data).select(selectBuffer(5));
    expect(result).toEqual(6);
  });

  test.skip('Able to pass in a custom selector using the creator with mismatched types', () => {
    const data = { a: 1, b: 'two', c: true };

    const selectBuffer: SelectorCreator<typeof data, number> =
      (buffer: number) => (d) =>
        (d?.a ?? 0) + buffer;

    // This currently fails because the types aren't lining up correctly.
    // This should be throwing a type error
    withSelector(data).select(selectBuffer('5'));
  });
});
