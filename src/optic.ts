import { AffineTraversal, Either, Lens, Opt } from "./type"
import { deleteAtKey, left, right, updateAt, updateAtKey } from "./common"

export function _f<S, F extends keyof S>(field: F): Lens<S, S[F]> {
  return lens(
    (s) => s[field],
    (s, a) => ({...s, [field]: a}),
  )
}

export function ix<A>(i: number): AffineTraversal<A[], A>
export function ix<A>(i: string): AffineTraversal<Record<string, A>, A>
export function ix<A>(i: number | string): AffineTraversal<A[], A> | AffineTraversal<Record<string, A>, A> {
  if (typeof i === "number") {
    return affineTraversal<A[], A>(
      (xs) => i < 0 || i >= xs.length ? left(xs) : right(xs[i]),
      (xs, x) => updateAt(i, x, xs),
    )
  }

  return affineTraversal<Record<string, A>, A>(
    (mx) => i in mx ? right(mx[i]) : left(mx),
    (mx, x) => updateAtKey(i, x, mx),
  )
}

export function at<A>(k: string): Lens<Record<string, A>, Opt<A>> {
  return lens(
    (s) => k in s ? s[k] : undefined,
    (s, a) => a === undefined ? deleteAtKey(k, s) : updateAtKey(k, a, s)
  )
}

export function opt<S>(): AffineTraversal<Opt<S>, S> {
  return affineTraversal(
    (s) => s === undefined ? left(s) : right(s),
    (_, a) => a,
  )
}

export function lens<S, A>(get: (s: S) => A, set: (s: S, a: A) => S): Lens<S, A> {
  return { kind : "Lens", get, set }
}

export function affineTraversal<S, A>(match: (s: S) => Either<S, A>, update: (s: S, a: A) => S): AffineTraversal<S, A> {
  return { kind : "AffineTraversal", match, update }
}

export function lensToAffineTraversal<S, A>(optic: Lens<S, A>): AffineTraversal<S, A> {
  return affineTraversal(s => right(optic.get(s)), optic.set)
}

export function composeLens<S, A, T>(opticL: Lens<S, A>, opticR: Lens<A, T>): Lens<S, T> {
  return lens(
    (s)    => opticR.get(opticL.get(s)),
    (s, v) => opticL.set(s, opticR.set(opticL.get(s), v))
  )
}

export function composeAffineTraversal<S, A, T>(opticL: AffineTraversal<S, A>, opticR: AffineTraversal<A, T>): AffineTraversal<S, T> {
  function match(s: S): Either<S, T> {
    const ei0 = opticL.match(s)

    if (ei0.kind === "Left") {
      return ei0
    }

    const ei1 = opticR.match(ei0.value)

    if (ei1.kind === "Left") {
      return left(s)
    }

    return ei1
  }

  function update(s: S, t: T): S {
    const ei0 = opticL.match(s)

    if (ei0.kind === "Left") {
      return ei0.value
    }

    return opticL.update(s, opticR.update(ei0.value, t))
  }

  return affineTraversal(
    match,
    update
  )
}

export function view<S, A>(optic: Lens<S, A>, s: S): A {
  return optic.get(s)
}

export function preview<S, A>(optic: AffineTraversal<S, A>, s: S): Opt<A> {
  const ei = optic.match(s)

  if (ei.kind === "Left") {
    return undefined
  }

  return ei.value
}

export function set<S, A>(optic: Lens<S, A> | AffineTraversal<S, A>, a: A, s: S): S {
  if (optic.kind === "Lens") {
    return optic.set(s, a)
  } else {
    return optic.update(s, a)
  }
}

export function over<S, A>(optic: Lens<S, A> | AffineTraversal<S, A>, f: (a: A) => A, s: S): S {
  if (optic.kind === "Lens") {
    return optic.set(s, f(optic.get(s)))
  }

  const ei = optic.match(s)

  if (ei.kind === "Left") {
    return ei.value
  }

  return optic.update(s, f(ei.value))
}
