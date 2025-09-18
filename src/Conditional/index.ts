/**
 * Utility types and functions for evaluating conditions with a shared context.
 *
 * This is useful for scenarios where you need to execute different logic based on certain conditions.
 * This is a system that allows for flexible IOC condition evaluation, similar to a rules engine or
 * chained if-else structure.
 *
 * Furthermore this takes inspiration from the TC39 proposal for `match` expressions.
 * More about this proposal can be found here:
 * @see https://github.com/tc39/proposal-pattern-matching
 *
 * While there are some existing tools like [ts-pattern](https://github.com/gvergnaud/ts-pattern)
 * that perform a similar function, this implementation is designed to be lightweight and flexible,
 * allowing for easy integration into existing TypeScript projects without additional dependencies.
 *
 * Some key differences from `ts-pattern` include:
 * - `ts-pattern` uses a more declarative style using a builder pattern whereas this uses a more
 *  functional approach.
 * - This pattern allows for grouping of conditions that share a validity check, which can be useful for
 *  more complex scenarios. As well the pattern also supports nested groups of conditions.
 * - `ts-pattern` requires that either `.exhaustive()` or `.otherwise()` is called in order to execute the
 *  condition checks. This implementation does not require this, by always executing conditions and ensuring
 *  that a default value is returned if no conditions are met (`ts-pattern` will throw an error if no
 *  conditions are met and `.otherwise()` isn't present).
 * - The context property of this implementation allows for more utility to be used in the condition checks,
 *  by allowing non data properties to be passed in, such as methods. `ts-pattern` only allows for pattern matching
 *  against the shape of the resulting data using static values.
 * - This implementation allows for conditions to enforce an escape hatch by setting the `continue` property to `true`.
 *  This allows for conditions to be evaluated in a more flexible way, where the evaluation can continue even if
 *  a condition is met. `ts-pattern` does not have this feature. This is useful for scenarios where you want to
 *  evaluate multiple conditions and, through the context, append to a data structure or perform multiple actions.
 *
 * @author Cameron McNaught <cameron.mcnaught@justeattakeaway.com>
 * @version 1.0.0
 */

type ConditionBase<Context> = {
  /**
   * If the condition should be executed.
   * @param context - shared context
   */
  isValid(context: Context): boolean;
  /**
   * If upon the end of the condition execution, the evaluation should keep checking other conditions.
   * @default false - the evaluation will stop after this condition is executed.
   */
  continue?: boolean;
};

/**
 * Utility type for defining conditions with a context and result type.
 * @template Result - The type of the result returned by the condition.
 * @template Context - The type of the context used to evaluate the condition (if applicable).
 */
export type Condition<Result, Context> = ConditionBase<Context> & {
  /**
   * Callback to run should the condition be valid.
   * @param context - shared context
   */
  execute(context: Context): Result;
};

/**
 * Utility type for grouping conditions that share a validity check.
 * @template Result - The type of the result returned by the condition.
 * @template Context - The type of the context used to evaluate the condition (if applicable).
 */
export type ConditionGroup<Result, Context> = ConditionBase<Context> & {
  /**
   * Collection of conditions to evaluate should the group be valid.
   */
  conditions:
    | (Condition<Result, Context> | ConditionGroup<Result, Context>)[]
    | [];
};

/**
 * Utility to evaluate conditions and groups of conditions and execute the first valid one.
 *
 * @param conditions - An array of conditions or condition groups to evaluate. This does support nested groups.
 * @param context - The shared context to use for evaluating the conditions.
 * @param defaultValue - The value to return if no conditions are valid.
 * @template R - The type of the result returned by the condition. This will be inferred if not explicity provided.
 * @template C - The type of the context used to evaluate the condition (if applicable). This will be inferred if not explicity provided.
 */
export const evaluateConditions = <Result, Context>(args: {
  conditions: (Condition<Result, Context> | ConditionGroup<Result, Context>)[];
  context: Context;
  defaultValue: Result;
}): Result => {
  const { conditions, context, defaultValue } = args;
  for (const condition of conditions) {
    if (condition.isValid(context)) {
      // If the condition is a group, evaluate its conditions recursively
      const result =
        'conditions' in condition
          ? evaluateConditions({ ...args, conditions: condition.conditions })
          : condition.execute(context);

      if (!condition.continue) {
        return result;
      }
    }
  }
  return defaultValue;
};
