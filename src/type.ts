import * as Sym from "./symbol"

export type Opt<A> = A | undefined

type Left<A> = {
  kind  : "Left"
  value : A
}
type Right<B> = {
  kind  : "Right"
  value : B
}
export type Either<A, B> = Left<A> | Right<B>

export type Lens<S, A> = {
  kind : "Lens"
  get  : (s: S) => A
  set  : (s: S, a: A) => S
}

export type AffineTraversal<S, A> = {
  kind   : "AffineTraversal"
  update : (s: S, b: A) => S
  match  : (s: S) => Either<S, A>
}

export type Atom<S> = {
  [Sym.atom] : typeof Sym.atom
  kind       : "Atom"
  get        : () => S
  set        : (a: S) => void
  over       : (f: (a: S) => S) => void
  v          : <A>(optic: Lens<S, A>) => Atom<A>
  vf         : <F extends keyof S>(field: F) => Atom<S[F]>
  p          : <A>(optic: AffineTraversal<S, A>) => AtomPreview<A>
}
export type AtomPreview<S> = {
  [Sym.atom] : typeof Sym.atom
  kind       : "AtomPreview"
  get        : () => Opt<S>
  set        : (s: S) => void
  over       : (f: (s: S) => S) => void
  p          : <A>(optic: AffineTraversal<S, A> | Lens<S, A>) => AtomPreview<A>
  pf         : <F extends keyof S>(field: F) => AtomPreview<S[F]>
}

export type AtomProxy<S> = {
  [F in keyof S]: Atom<S[F]>
}
export type AtomPreviewProxy<S> = {
  [F in keyof S]: AtomPreview<S[F]>
}
