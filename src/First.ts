import { Monoid } from "./typeclass"
import { Opt } from "./Opt"


export interface First<A> {
  getFirst: Opt<A>
}


export function First<A>(a: Opt<A>): First<A> {
  return {
    getFirst: a
  }
}


export function FirstMonoid<A>(): Monoid<First<A>> {
  return {
    mempty: First(undefined as Opt<A>),
    append(a0: First<A>): (a1: First<A>) => First<A> {
      return a1 => a0.getFirst === undefined ? a1 : a0
    },
  }
}
