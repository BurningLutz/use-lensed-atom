import { AffineTraversal, AtomPreview, AtomPreviewProxy, Atom, AtomProxy, Lens } from "./type"
import { updateAt, updateAtKey } from "./common"
import * as Sym from "./symbol"
import * as O from "./optic"

export function atomView<S>(getter: () => S, setter: (f: (s: S) => S) => void): Atom<S> {
  function createView<A>(opticL: Lens<S, A>): Atom<A> {
    function get() {
      return O.view(opticL, getter())
    }
    function set(a: A) {
      setter((s) => O.set(opticL, a, s))
    }
    function over(f: (a: A) => A) {
      setter((s) => O.over(opticL, f, s))
    }
    function v<T>(opticR: Lens<A, T>): Atom<T> {
      return createView(O.composeLens(opticL, opticR))
    }
    function vf<F extends keyof A>(field: F): Atom<A[F]> {
      return v(O._f(field))
    }
    function p<T>(opticR: AffineTraversal<A, T>): AtomPreview<T> {
      return createPreview(O.composeAffineTraversal(O.lensToAffineTraversal(opticL), opticR))
    }

    return {
      [Sym.atom] : Sym.atom,
      kind       : "Atom",
      get,
      set,
      over,
      v,
      vf,
      p,
    }
  }

  function createPreview<A>(opticL: AffineTraversal<S, A>): AtomPreview<A> {
    function get() {
      return O.preview(opticL, getter())
    }
    function set(a: A) {
      setter((s) => O.set(opticL, a, s))
    }
    function over(f: (a: A) => A) {
      setter((s) => O.over(opticL, f, s))
    }
    function p<T>(opticR: AffineTraversal<A, T> | Lens<A, T>): AtomPreview<T> {
      let opticR_

      if (opticR.kind === "Lens") {
        opticR_ = O.lensToAffineTraversal(opticR)
      } else {
        opticR_ = opticR
      }

      return createPreview(O.composeAffineTraversal(opticL, opticR_))
    }
    function pf<F extends keyof A>(field: F): AtomPreview<A[F]> {
      return p(O._f(field))
    }

    return {
      [Sym.atom] : Sym.atom,
      kind       : "AtomPreview",
      get,
      set,
      over,
      p,
      pf,
    }
  }

  return createView(O.lens(s => s, (_, a) => a))
}

export function destructure<S, F extends string & keyof S>(atom: Atom<S>): AtomProxy<S>
export function destructure<S, F extends string & keyof S>(atom: AtomPreview<S>): AtomPreviewProxy<S>
export function destructure<S, F extends string & keyof S>(atom: Atom<S> | AtomPreview<S>): AtomProxy<S> | AtomPreviewProxy<S> {
  const proxy = new Proxy(atom, {
    get: (s, field: F) => {
      if (s.kind === "Atom") {
        return s.v(O._f(field))
      } else {
        return s.p(O._f(field))
      }
    }
  })
  // I need this trick to workaround the type mismatch issue when working with Proxy
  return proxy as any
}

export function toList<A>(atom: Atom<A[]>): Atom<A>[] {
  return atom.get().map((x, i) => atomView(
    () => x,
    (f) => atom.over(xs => updateAt(i, f(x), xs))
  ))
}

export function toEntries<A>(atom: Atom<Record<string, A>>): [string, Atom<A>][] {
  return Object.entries(atom.get()).map(([k, x]) => [k, atomView(
    () => x,
    (f) => atom.over(mx => updateAtKey(k, f(x), mx))
  )])
}
