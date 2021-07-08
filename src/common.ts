import { Functor, Lens } from "ramda"
import * as R from "ramda"

import * as Sym from "./symbol"
import { Opt } from "./type"


// A modified version of `Object.is`
export function is(x: any, y: any): boolean {
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

export function Identity<U>(x: U): Functor<U> {
  return {
    value: x,
    "fantasy-land/map": f => Identity(f(x))
  }
}

// lift a lens to a partial lens
export function lift<S, A>(lens: Lens<S, A>): Lens<Opt<S>, Opt<A>> {
  return function (toFunctorFn) {
    return function (target) {
      if (target === undefined) {
        return Identity(undefined)
      } else {
        return lens(a => R.map(x => x === undefined ? a : x, toFunctorFn(a)))(target)
      }
    }
  }
}
export function lift_<S, A>(lens: Lens<S, Opt<A>>): Lens<Opt<S>, Opt<A>> {
  return function (toFunctorFn) {
    return function (target) {
      if (target === undefined) {
        return Identity(undefined)
      } else {
        return lens(toFunctorFn)(target)
      }
    }
  }
}
