# Zustand - createStore

This is a custom utility around Zustand's `create` method for creating stores in React. The goal of this is to reduce the boilerplate of setting up a store.

## Motivation

Typically a store has the following similarities:

- Initial state data
- Setters for all it's initial state
- (optional) Some computed values or additional methods
- (optional) A reset function to revert the state back to it's initial

In practice this would look something similar to:

```typescript
import { create } from 'zustand';

type State = {
  firstName: string;
  lastName: string;
  age: number;
};

type Actions = {
  setFirstName(v: string): void;
  setLastName(v: string): void;
  setAge(v: string): void;
  reset(): void;
};

const initialState = {
  firstName: '',
  lastName: '',
  age: 0,
};

const usePersonState = create<State & Actions>()((set) => ({
  ...initialState,
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setFirstName: (age) => set({ age }),
  reset: () => set({ ...initialState }),
}));
```

With this new utility all this boilerplate has been reduced to:

```typescript
const usePersonState = createStore({
  firstName: '',
  lastName: '',
  age: 0,
});
```

### Computed Values

In some situations you may have additional methods or computed fields that shouldn't have a setter. These can be added via the optional 2nd argument.

```typescript
const usePersonState = createStore(
  {
    firstName: '',
    lastName: '',
    age: 0,
  },
  (set, get) => ({
    isOfLegalAge(countryCode: 'CAN' | 'USA') {
      switch (countryCode) {
        case 'CAN':
          return get().age >= 18;
        case 'USA':
          return get().age >= 21;
        default:
          return false;
      }
    },
  })
);
```

## Overriding generated methods

In rare situations you may have the need to override a setter or reset method to perform additional logic beyond the default. Overriding these is as simple as providing your override logic in the 2nd argument.

```typescript
const usePersonState = createStore(
  {
    firstName: '',
    lastName: '',
    age: 0,
  },
  (set, get) => ({
    setFirstName(firstName: string) {
      if (!firstName) {
        set({ lastName: '' });
      }
      set({ firstName });
    },
  })
);
```

## Using `readonly`

TypeScript provides usage of the `readonly` keyword to indicate values are immutable and shouldn't be modified. This utility leverages this to avoid creating setters\* for those properties.

```typescript
type State = {
  firstName: string;
  lastName: string;
  readonly age: number;
};

const usePersonState = createStore<State>({
  firstName: '',
  lastName: '',
  age: 0,
});

usePersonState.getState().setAge(); // Throws a TypeScript error
usePersonState((s) => s.setAge()); // Throws a TypeScript error
```

> \* NOTE: Since the `readonly` keyword is available at compile time and no such keyword/functionality exists in JS, the setter method will still be generated for these properties and can still be accessed by ignoring the TypeScript error.

This pattern can be useful if creating a property that shouldn't be modified directly and instead via a builder or other custom method.

```typescript
type State = {
  readonly firstName: string;
  readonly lastName: string;
  age: number;
};

type Actions = {
  setName(v: Omit<State, 'age'>): void;
};

const usePersonState = createStore<State>(
  {
    firstName: '',
    lastName: '',
    age: 0,
  },
  (set, get) => ({
    setName: (name) => set({ ...name }),
  })
);

usePersonState.getState().firstName; // ""
usePersonState.getState().lastName; // ""
usePersonState.getState().setName({ firstName: 'John', lastName: 'Doe' });
usePersonState.getState().firstName; // "John"
usePersonState.getState().lastName; // "Doe"
```

## FAQ

**Q: Why do I need to specify types in some instances and not in others?**

The utility can infer the type for both arguments from the implementation so in most situations you shouldn't need to explicitly provide the types. HOwever if you state contains any union or complex types, then explicitly providing the type is recommended.

```typescript
const useLocaleState = createStore({ locale: '' });
useLocaleState.getState().setLocale('invalid'); // Valid as type is `string`

----
type State = { locale: 'en-CA' | 'fr-CA' };
const useLocaleState = createStore({ locale: 'en-CA' });
useLocaleState.getState().setLocale('invalid'); // Invalid
```
