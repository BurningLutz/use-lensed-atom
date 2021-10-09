import { _f } from "."
import * as Sym from "./symbol"
import { Either } from "./type"


// A modified version of `Object.is`
function is(x: any, y: any): boolean {
  if (x[Sym.atom] === Sym.atom && y[Sym.atom] === Sym.atom) {
    x = x.get()
    y = y.get()
  }

  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export function shallowEqual(objA: any, objB: any): boolean {
  if (is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}

export function left<A, B>(a: A): Either<A, B> {
  return {
    kind  : "Left",
    value : a
  }
}

export function right<A, B>(b: B): Either<A, B> {
  return {
    kind  : "Right",
    value : b
  }
}

export function updateAt<A>(i: number, x: A, xs: A[]): A[] {
  let xs_ = xs

  if (i < xs.length) {
    xs_ = xs.slice(0)
    xs_[i] = x
  }

  return xs_
}

export function updateAtKey<A>(k: string, x: A, mx: Record<string, A>): Record<string, A> {
  const mx_ = {...mx, [k]: x}

  return mx_
}

export function deleteAtKey<A>(k: string, mx: Record<string, A>): Record<string, A> {
  const mx_ = {...mx}
  delete mx_[k]

  return mx_
}
