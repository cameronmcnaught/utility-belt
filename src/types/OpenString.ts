/**
 * TypeScript utility type to include type-checking for a union of strings, while allowing any string to be used.
 * @see https://youtu.be/lraHlXpuhKs?si=7LWQTqNJsbPOhwrl&t=481
 */
export type OpenString<S extends string> = S | (string & {});
