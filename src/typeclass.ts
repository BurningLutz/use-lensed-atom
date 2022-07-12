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
