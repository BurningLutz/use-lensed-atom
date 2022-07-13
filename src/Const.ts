import { HKT } from "./hkt"
import { Applicative, Functor, Monoid } from "./typeclass"


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


export function ConstApplicative<A>(m: Monoid<A>): Applicative<ConstHKT<A>> {
  return {
    fmap : ConstFunctor<A>().fmap,
    pure<B>(_: B): Const<A, B> {
      return Const(m.mempty)
    },
    ap<B, C>(fab: Const<A, (b: B) => C>): (fa: Const<A, B>) => Const<A, C> {
      return fa => Const(m.append(fab.getConst)(fa.getConst))
    },
  }
}
