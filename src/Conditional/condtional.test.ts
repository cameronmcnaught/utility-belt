import { expect, test, describe } from 'bun:test';
import { evaluateConditions, type Condition, type ConditionGroup } from '.';

describe('evaluateConditions', () => {
  test('should return the result of the 2nd condition', () => {
    const result = evaluateConditions({
      conditions: [
        {
          isValid: () => false,
          execute: () => 'Condition 1 is true',
        },
        {
          isValid: () => true,
          execute: () => 'Condition 2 is true',
        },
      ],
      context: {},
      defaultValue: 'No conditions are true',
    });
    expect(result).toBe('Condition 2 is true');
  });

  test('should return the default value when no conditions are valid', () => {
    const result = evaluateConditions({
      conditions: [
        {
          isValid: () => false,
          execute: () => 'Condition 1 is true',
        },
        {
          isValid: () => false,
          execute: () => 'Condition 2 is true',
        },
      ],
      context: {},
      defaultValue: 'No conditions are true',
    });
    expect(result).toBe('No conditions are true');
  });

  test('should return the 2nd condition of the 2nd condition group', () => {
    const result = evaluateConditions({
      conditions: [
        {
          isValid: () => false,
          conditions: [
            {
              isValid: () => false,
              execute: () => 'Condition 1 is true',
            },
            {
              isValid: () => true,
              execute: () => 'Condition 2 is true',
            },
          ],
        },
        {
          isValid: () => true,
          conditions: [
            {
              isValid: () => false,
              execute: () => 'Condition 3 is true',
            },
            {
              isValid: () => true,
              execute: () => 'Condition 4 is true',
            },
          ],
        },
      ],
      context: {},
      defaultValue: 'No conditions are true',
    });
    expect(result).toBe('Condition 4 is true');
  });

  test('should return the result of condition 1 & 3 when `continue` is true', () => {
    const results: string[] = [];

    evaluateConditions({
      conditions: [
        {
          isValid: () => true,
          execute: ({ list }) => list.push('Condition 1 is true'),
          continue: true,
        },
        {
          isValid: () => false,
          execute: ({ list }) => list.push('Condition 2 is true'),
          continue: true,
        },
        {
          isValid: () => true,
          execute: ({ list }) => list.push('Condition 3 is true'),
          continue: true,
        },
      ],
      context: {
        list: results,
      },
      defaultValue: 0,
    });

    expect(results?.length).toBe(2);
    expect(results?.[0]).toBe('Condition 1 is true');
    expect(results?.[1]).toBe('Condition 3 is true');
  });

  test('should return the result of condition 1 when `continue` is false', () => {
    const results: string[] = [];
    evaluateConditions({
      conditions: [
        {
          isValid: () => true,
          execute: ({ list }) => list.push('Condition 1 is true'),
          continue: false,
        },
        {
          isValid: () => false,
          execute: ({ list }) => list.push('Condition 2 is true'),
          continue: true,
        },
        {
          isValid: () => true,
          execute: ({ list }) => list.push('Condition 3 is true'),
          continue: true,
        },
      ],
      context: {
        list: results,
      },
      defaultValue: undefined,
    });

    expect(results?.length).toBe(1);
    expect(results?.[0]).toBe('Condition 1 is true');
  });

  test('should return the result of condition 2 & 4 when `continue` is `true` on both groups', () => {
    const results: string[] = [];
    evaluateConditions({
      conditions: [
        {
          isValid: () => true,
          continue: true,
          conditions: [
            {
              isValid: () => false,
              execute: ({ list }) => list.push('Condition 1 is true'),
            },
            {
              isValid: () => true,
              execute: ({ list }) => list.push('Condition 2 is true'),
              continue: true,
            },
          ],
        },
        {
          isValid: () => true,
          conditions: [
            {
              isValid: () => false,
              execute: ({ list }) => list.push('Condition 3 is true'),
            },
            {
              isValid: () => true,
              execute: ({ list }) => list.push('Condition 4 is true'),
              continue: true,
            },
          ],
        },
      ],
      context: { list: results },
      defaultValue: -1,
    });

    expect(results?.length).toBe(2);
    expect(results?.[0]).toBe('Condition 2 is true');
    expect(results?.[1]).toBe('Condition 4 is true');
  });

  test('should return the result of condition 2 & 4 when using models', () => {
    type TextCondition = Condition<number, { list: string[] }>;
    type TextConditionGroup = ConditionGroup<number, { list: string[] }>;

    const c1: TextCondition = {
      isValid: () => false,
      execute: ({ list }) => list.push('Condition 1 is true'),
    };

    const c2: TextCondition = {
      isValid: () => true,
      execute: ({ list }) => list.push('Condition 2 is true'),
    };

    const c3: TextCondition = {
      isValid: () => false,
      execute: ({ list }) => list.push('Condition 3 is true'),
    };

    const c4: TextCondition = {
      isValid: () => true,
      execute: ({ list }) => list.push('Condition 4 is true'),
    };

    const g1: TextConditionGroup = {
      isValid: () => true,
      continue: true,
      conditions: [c1, c2],
    };

    const g2: TextConditionGroup = {
      isValid: () => true,
      conditions: [c3, c4],
    };

    const results: string[] = [];
    evaluateConditions({
      conditions: [g1, g2],
      context: {
        list: results,
      },
      defaultValue: 0,
    });

    expect(results.length).toBe(2);
    expect(results[0]).toBe('Condition 2 is true');
    expect(results[1]).toBe('Condition 4 is true');
  });

  test('should return the result of condition 2 & 4 when using nested groups with continue', () => {
    const results: string[] = [];
    evaluateConditions({
      conditions: [
        {
          isValid: () => true,
          conditions: [
            {
              isValid: () => true,
              continue: true,
              conditions: [
                {
                  isValid: () => false,
                  execute: ({ list }) => list.push('Condition 1 is true'),
                },
                {
                  isValid: () => true,
                  execute: ({ list }) => list.push('Condition 2 is true'),
                  continue: true,
                },
              ],
            },
            {
              isValid: () => true,
              continue: true,
              conditions: [
                {
                  isValid: () => false,
                  execute: ({ list }) => list.push('Condition 3 is true'),
                },
                {
                  isValid: () => true,
                  execute: ({ list }) => list.push('Condition 4 is true'),
                  continue: true,
                },
              ],
            },
          ],
        },
      ],
      context: { list: results },
      defaultValue: -1,
    });

    expect(results?.length).toBe(2);
    expect(results?.[0]).toBe('Condition 2 is true');
    expect(results?.[1]).toBe('Condition 4 is true');
  });
});
