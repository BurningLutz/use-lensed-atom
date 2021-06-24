import { Lens } from "ramda"

import * as Sym from "./symbol"


// add missing ramda declarations
declare module "ramda" {
  export function prop<P extends keyof T, T>(p: P): (obj: T) => T[P]
  export function over<S, A>(lens: Lens<S, A>): (fn: (a: A) => A) => (s: S) => S
}

export type Opt<U> = U | undefined
export type Over<S> = (f: ((s: S) => S)) => void
export type Atom<S> = {
  [Sym.atom] : typeof Sym.atom,
  get        : () => S
  set        : (s: S) => void
  over       : Over<S>
  v          : <A>(lens: Lens<S, A>) => Atom<A>
}
export type AtomProxy<S> = {
  [F in string & keyof S]: Atom<S[F]>
}
