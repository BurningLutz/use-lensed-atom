import { HKT } from "./hkt"
import { Functor, Applicative } from "./typeclass"


export interface IdentityHKT extends HKT {
  type: Identity<this["A"]>
}


export interface Identity<A> {
  getIdentity: A
}


export function Identity<A>(a: A): Identity<A> {
  return {
    getIdentity: a
  }
}


export const IdentityFunctor: Functor<IdentityHKT> = {
  fmap<A, B>(f: (a: A) => B): (fa: Identity<A>) => Identity<B> {
    return fa => Identity(f(fa.getIdentity))
  }
}


export const IdentityApplicative: Applicative<IdentityHKT> = {
  fmap : IdentityFunctor.fmap,
  pure<A>(a: A): Identity<A> {
    return Identity(a)
  },
  ap<A, B>(fab: Identity<(a: A) => B>): (fa: Identity<A>) => Identity<B> {
    return fa => Identity(fab.getIdentity(fa.getIdentity))
  },
}
