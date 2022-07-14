import { HKT, Kind } from "./hkt"


export interface TypeClass<F extends HKT> {
  readonly TS?: F
}


export interface Functor<F extends HKT> extends TypeClass<F> {
  readonly fmap: <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>
}


export interface Applicative<F extends HKT> extends Functor<F> {
  readonly pure: <A>(a: A) => Kind<F, A>
  readonly ap: <A, B>(fab: Kind<F, (a: A) => B>) => (fa: Kind<F, A>) => Kind<F, B>
}


export interface Semigroup<A> {
  readonly append: (a0: A) => (a1: A) => A
}


export interface Monoid<A> extends Semigroup<A> {
  readonly mempty: A
}


export interface Foldable<T extends HKT> extends TypeClass<T> {
  readonly foldr: <A, B>(f: (a: A) => (b: B) => B) => (b: B) => (ta: Kind<T, A>) => B
}


export interface Traversable<T extends HKT> extends Foldable<T> {
  readonly traverse: <F extends HKT>(ins: Applicative<F>) => <A, B>(f: (a: A) => Kind<F, B>) => (t: Kind<T, A>) => Kind<F, Kind<T, B>>
}
