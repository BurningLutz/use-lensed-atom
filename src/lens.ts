import { Lens } from "ramda"
import * as R from "ramda"

import { Atom, AtomProxy, Opt } from "./type"
import { lift, lift_ } from "./common"


// a field lens focused on a field of an object
export function f<S, F extends string & keyof S>(field: F): Lens<S, S[F]> {
  return R.lens<S, S[F]>(R.prop(field), R.assoc(field))
}
export function f_<S, F extends string & keyof S>(field: F): Lens<Opt<S>, Opt<S[F]>> {
  return lift(f(field))
}

// an index lens focused on an elem of an array by index
export function i<A>(index: number): Lens<A[], Opt<A>> {
  return R.lens(
    R.nth(index)
  , (a, s) => a === undefined
    ? R.remove(index, 1, s)
    : R.update(index, a, s)
  )
}
export function i_<A>(index: number): Lens<Opt<A[]>, Opt<A>> {
  return lift_(i(index))
}

// a key lens focused on a key of a map
export function k<A>(key: string): Lens<Record<string, A>, Opt<A>> {
  return R.lens<Record<string, A>, Opt<A>>(
    R.prop(key)
  , (a, s) => a === undefined
    ? R.dissoc(key, s)
    : R.assoc(key, a, s)
  )
}
export function k_<A>(key: string): Lens<Opt<Record<string, A>>, Opt<A>> {
  return lift_(k(key))
}

export function destructure<S, F extends string & keyof S>(atom: Atom<S>): AtomProxy<S> {
  const proxy = new Proxy(atom, {
    get: (s, field: F) => s.v(f(field))
  })
  // I need this trick to workaround the type mismatch issue when working with Proxy
  return proxy as any
}
