import { HKT } from "./hkt"
import { Applicative, Functor } from "./typeclass"
import { Opt } from "./Opt"
import * as O from "./optic"
import * as Sym from "./symbol"
import { updateIx } from "./common"


export interface Atom {
  [Sym.atom] : typeof Sym.atom
}


export interface AtomLens<S> extends Atom {
  kind : "AtomLens"
  view : () => S
  set  : (s: S) => void
  over : (f: (s: S) => S) => void
  compose<A>(l: O.Lens_<S, A>): AtomLens<A>
  compose<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
  c<A>(l: O.Lens_<S, A>): AtomLens<A>
  c<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
}


export type AtomLensProxy<R> = {
  [K in keyof R]: AtomLens<R[K]>
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
    if ("__lens__" in o) {
      const c =  <F extends HKT>(ins: Functor<F>
            ) => O.compose(l(ins), o(ins))

      return AtomLens(getRoot, setRoot, O.tagLens(c))
    } else {
      const c =  <F extends HKT>(ins: Applicative<F>
            ) => O.compose(l(ins), o(ins))

      return AtomTraversal(getRoot, setRoot, O.tagTraversal(c))
    }
  }

  return {
    [Sym.atom] : Sym.atom,
    kind       : "AtomLens",
    c          : compose,
    view,
    set,
    over,
    compose,
  }
}


export interface AtomTraversal<S> extends Atom {
  kind    : "AtomTraversal"
  preview : () => Opt<S>
  set     : (s: S) => void
  over    : (f: (s: S) => S) => void
  compose<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
  c<A>(l: O.Traversal_<S, A>): AtomTraversal<A>
}


export type AtomTraversalProxy<R> = {
  [K in keyof R]: AtomTraversal<R[K]>
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

  function compose<B>(o: O.Traversal_<A, B>): AtomTraversal<B> {
    const c = <F extends HKT>(ins: Applicative<F>) => O.compose(l(ins), o(ins))

    return AtomTraversal(getRoot, setRoot, O.tagTraversal(c))
  }

  return {
    [Sym.atom] : Sym.atom,
    kind       : "AtomTraversal",
    c          : compose,
    preview,
    set,
    over,
    compose,
  }
}


export function sequence<A>(atom: AtomLens<A[]>): AtomLens<A>[]
export function sequence<A>(atom: AtomTraversal<A[]>): AtomTraversal<A>[]
export function sequence<A>(atom: AtomLens<A[]> | AtomTraversal<A[]>): AtomLens<A>[] | AtomTraversal<A>[] {
  let sec
  if (atom.kind === "AtomLens") {
    sec = atom.view()
  } else {
    sec = atom.preview() || []
  }

  return sec.map((x, ix) => AtomLens(
    ( ) => x,
    (f) => atom.over(xs => updateIx(ix, f(x), xs)),
    O.id(),
  ))
}


export function sequenceRec<A>(atom: AtomLens<Record<string, A>>): Record<string, AtomLens<A>>
export function sequenceRec<A>(atom: AtomTraversal<Record<string, A>>): Record<string, AtomTraversal<A>>
export function sequenceRec<A>(atom: AtomLens<Record<string, A>> | AtomTraversal<Record<string, A>>): Record<string, AtomLens<A>> | Record<string, AtomTraversal<A>> {
  let obj
  if (atom.kind === "AtomLens") {
    obj = atom.view()
  } else {
    obj = atom.preview() || {}
  }

  return Object.fromEntries(Object.entries(obj).map(([k, x]) => [k, AtomLens(
    ( ) => x,
    (f) => atom.over(rec => updateIx(k, f(x), rec)),
    O.id(),
  )]))
}


export function destructure<K extends string & keyof R, R>(atom: AtomLens<R>): AtomLensProxy<R>
export function destructure<K extends string & keyof R, R>(atom: AtomTraversal<R>): AtomTraversalProxy<R>
export function destructure<K extends string & keyof R, R>(atom: AtomLens<R> | AtomTraversal<R>): AtomLensProxy<R> | AtomTraversalProxy<R> {
  const proxy = new Proxy(atom, {
    get: (s, field: K) => s.c(O.f(field))
  })
  // I need this trick to workaround the type mismatch issue when working with Proxy
  return proxy as any
}
