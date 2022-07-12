import { HKT } from "./hkt"
import { Functor } from "./typeclass"


export interface ConstHKT<A> extends HKT {
  type: Const<A, this["A"]>
}


export interface Const<A, _> {
  getConst: A
}


export function Const<A, B>(a: A): Const<A, B> {
  return {
    getConst: a
  }
}


export function ConstFunctor<A>(): Functor<ConstHKT<A>> {
  return {
    fmap<B, C>(_: (b: B) => C): (fa: Const<A, B>) => Const<A, C> {
      return fa => Const(fa.getConst)
    }
  }
}
