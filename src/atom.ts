import { HKT } from "./hkt"
import { Applicative, Functor } from "./typeclass"
import { Opt } from "./Opt"
import * as O from "./optic"
import * as Sym from "./symbol"


export interface AtomLens<S> {
  view(): S
  set(s: S): void
  over(f: (s: S) => S): void
  compose<A>(l: O.Lens_<S, A>): AtomLens<A>
  compose<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
  c<A>(l: O.Lens_<S, A>): AtomLens<A>
  c<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
}


export function AtomLens<S, A>(
  getRoot : () => S,
  setRoot : (f: (s: S) => S) => void,
  l       : O.Lens_<S, A>,
): AtomLens<A> {
  function view(): A {
    return O.view(l, getRoot())
  }

  function set(a: A) {
    setRoot(s => O.set(l, a, s))
  }

  function over(f: (a: A) => A) {
    setRoot(s => O.over(l, f, s))
  }

  function compose<B>(o: O.Lens_<A, B>): AtomLens<B>
  function compose<B>(o: O.Traversal_<A, B>): AtomTraversal<B>
  function compose<B>(o: O.Lens_<A, B> | O.Traversal_<A, B>): AtomLens<B> | AtomTraversal<B> {
    if (Sym.lens in o) {
      const c =  <F extends HKT>(ins: Functor<F>
            ) => O.compose( l(ins)
                          , (o as O.Lens_<A, B>)(ins)
                          )

      return AtomLens(getRoot, setRoot, O.tagLens(c))
    } else {
      const c =  <F extends HKT>(ins: Applicative<F>
            ) => O.compose( l(ins)
                          , (o as O.Traversal_<A, B>)(ins)
                          )

      return AtomTraversal(getRoot, setRoot, O.tagTraversal(c))
    }
  }

  return { view, set, over, compose, c: compose }
}


export interface AtomTraversal<S> {
  preview : () => Opt<S>
  set     : (s: S) => void
  over    : (f: (s: S) => S) => void
  compose<A>(l: O.Lens_<S, A>): AtomTraversal<A>
  compose<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
  c<A>(l: O.Lens_<S, A>): AtomTraversal<A>
  c<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
}


function AtomTraversal<S, A>(
  getRoot : () => S,
  setRoot : (f: (s: S) => S) => void,
  l       : O.Traversal_<S, A>,
): AtomTraversal<A> {
  function preview(): Opt<A> {
    return O.preview(l, getRoot())
  }

  function set(a: A) {
    setRoot(s => O.set(l, a, s))
  }

  function over(f: (a: A) => A) {
    setRoot(s => O.over(l, f, s))
  }

  function compose<B>(o: O.Lens_<A, B>): AtomTraversal<B>
  function compose<B>(o: O.Traversal_<A, B>): AtomTraversal<B>
  function compose<B>(o: O.Lens_<A, B> | O.Traversal_<A, B>): AtomTraversal<B> {
    const c = <F extends HKT>(ins: Applicative<F>) => O.compose(l(ins), o(ins))

    return AtomTraversal(getRoot, setRoot, O.tagTraversal(c))
  }

  return { preview, set, over, compose, c: compose }
}
