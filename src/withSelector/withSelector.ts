export type Selector<D, R> = (d?: D) => R | undefined;
export type SelectorCreator<D, R, A extends any[] = any[]> = (
  ...args: A
) => Selector<D, R>;

// Using the conditional here so that implementation doesn't need to know
// if the selector was created using a creator or not. Regardless, the
// return type will be the same.
export type SelectorResult<
  D,
  C extends SelectorCreator<D, R> | Selector<D, R>,
  R = unknown
> = ReturnType<C> extends Selector<D, R>
  ? ReturnType<ReturnType<C>>
  : ReturnType<C>;

/**
 * Returns the data and a `select` function that can be used to select
 * specific parts of the data using a selector function.
 *
 * I've found this helpful when working with large/complex data object where extracting
 * the specific pieces of data is needed, without needing the entire object. Most notably
 * I've used this with `@tanstack/react-query` when using the result of a query as the
 * source-of-truth. I was able to create a variety of selectors to extract or compute specific
 * pieces of data from the query result.
 *
 * @param data Data to wrap with a selector function and be passed to the selector.
 *
 * @todo Update the selector creator types to enforce the arguments and return type.
 */
export const withSelector = <D>(data: D) => ({
  ...data,
  select: <R>(selector: Selector<D, R>) => selector(data),
});
