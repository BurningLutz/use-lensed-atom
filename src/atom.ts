import * as O from "./optic"


type AtomLensType<T> = T extends any[]
                       ? IxedAtomLens<T> :
                       T extends Record<any, any>
                       ? IxedAtomLens<T> :
                       T extends object
                       ? ObjectAtomLens<T> :
                         AtomLens<T>


export interface AtomLens<S> {
  get(): S
  set(s: S): void
  modify(f: (s: S) => S): void
}


export interface IxedAtomLens<S> extends AtomLens<S> {
  at(): void
  ix(): void
}


export interface ObjectAtomLens<S> extends AtomLens<S> {
  f<K extends keyof S>(k: K): AtomLensType<S[K]>
}


export function AtomLens<S>(
  getState : () => S,
  setState : (f: (s: S) => S) => void,
): AtomLens<S> {
  return {
    get    : getState,
    set    : v => setState(() => v),
    modify : setState,
  }
}


export function ObjectAtomLens<S>(
  getState : () => S,
  setState : (f: (s: S) => S) => void,
): ObjectAtomLens<S> {
  return {
    ...AtomLens(getState, setState),
    f : k => {
      const s = getState()
      const get = undefined as any
      const set = undefined as any

      if (Array.isArray(s[k])) {
        return IxedAtomLens(get, set)
      }

      return IxedAtomLens(get, set)
    }
  }
}


export function IxedAtomLens<S>(
  getState : () => S,
  setState : (f: (s: S) => S) => void,
): IxedAtomLens<S> {}
