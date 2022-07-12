import { HKT, Kind } from "./hkt"
import { Functor, Applicative } from "./typeclass"
import { Const, ConstFunctor } from "./Const"
import { Identity, IdentityApplicative } from "./Identity"


type Opt<A> = NonNullable<A> | undefined


export type LensLike<S, T, A, B, F extends HKT>
  =  (f: (a: A) => Kind<F, B>)
  => (s: S)
  => Kind<F, T>


export type Lens<S, T, A, B> =  <F extends HKT>(ins: Functor<F>)
                             => LensLike<S, T, A, B, F>
export type Lens_<S, A> = Lens<S, S, A, A>


export type Traversal<S, T, A, B> =  <F extends HKT>(ins: Applicative<F>)
                                  => LensLike<S, T, A, B, F>
export type Traversal_<S, A> = Traversal<S, S, A, A>


export function compose<A, B, C>(f: (a: B) => C, g: (b: A) => B): (a: A) => C {
  return a => f(g(a))
}


export function lens<S, T, A, B>(getter: (s: S) => A, setter: (s: S) => (b: B) => T): Lens<S, T, A, B> {
  const ret =  <F extends HKT>
               (ins: Functor<F>
          ) => (f: (a: A) => Kind<F, B>
          ) => (s: S
          ) => {
            return ins.fmap(setter(s))(f(getter(s)))
          }

  return ret
}


export function view<S, A>(l: Lens<S, S, A, A>, s: S): A {
  return l(ConstFunctor<A>())(Const)(s).getConst
}


export function set<S, T, A, B>(l: Traversal<S, T, A, B>, b: B, s: S): T {
  return l(IdentityApplicative)(() => Identity(b))(s).getIdentity
}


export function f<K extends keyof R, R>(k: K): Lens<R, R, R[K], R[K]> {
  return lens<R, R, R[K], R[K]>(r => r[k], r => b => ({ ...r, [k]: b }))
}


export function ix<A>(k: number): Traversal_<A[], A>
export function ix<A>(k: string): Traversal_<Record<string, A>, A>
export function ix<A>(k: number | string): Traversal_<A[], A> | Traversal_<Record<string, A>, A> {
  if (typeof k === "number") {
    const ret =  <F extends HKT>
                 (ins: Applicative<F>
            ) => (f: (a: A) => Kind<F, A>
            ) => (s: A[]
            ) => {
              if (k in s) {
                return ins.fmap((v: A) => {
                  const t = s.slice(0)
                  t[k]    = v

                  return t
                })(f(s[k]))
              } else {
                return ins.pure(s)
              }
            }

    return ret
  } else {
    const ret =  <F extends HKT>
                 (ins: Applicative<F>
            ) => (f: (a: A) => Kind<F, A>
            ) => (s: Record<string, A>
            ) => {
              if (k in s) {
                return ins.fmap((v: A) => {
                  const t = Object.assign({}, s)
                  t[k]    = v

                  return t
                })(f(s[k]))
              } else {
                return ins.pure(s)
              }
            }

    return ret
  }
}


export function at<A>(k: number): Lens_<NonNullable<A>[], Opt<A>>
export function at<A>(k: string): Lens_<Record<string, NonNullable<A>>, Opt<A>>
export function at<A>(k: number | string): Lens_<NonNullable<A>[], Opt<A>> | Lens_<Record<string, NonNullable<A>>, Opt<A>> {
  if (typeof k === "number") {
    const ret =  <F extends HKT>
                 (ins: Functor<F>
            ) => (f: (a: Opt<A>) => Kind<F, Opt<A>>
            ) => (s: NonNullable<A>[]
            ) => {
              return ins.fmap((v: Opt<A>) => {
                const t = s.slice(0)

                if (v === undefined) {
                  delete t[k]
                } else {
                  t[k] = v
                }

                return t
              })(f(s[k]))
            }

    return ret
  } else {
    const ret =  <F extends HKT>
                 (ins: Functor<F>
            ) => (f: (a: Opt<A>) => Kind<F, Opt<A>>
            ) => (s: Record<string, NonNullable<A>>
            ) => {
              return ins.fmap((v: Opt<A>) => {
                const t = Object.assign({}, s)

                if (v === undefined) {
                  delete t[k]
                } else {
                  t[k] = v
                }

                return t
              })(f(s[k]))
            }

    return ret
  }
}


interface User {
  phones: string[]
  addr: {
    name: string
  }
}

const u: User = {
  phones: [ "13"
          , "412"
          , "sdfd"
          ]
  addr: {
    name: "fsdgf"
  }
}

console.log(set(compose(f("addr"), f("name")), "sdg", u))
